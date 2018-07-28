Ext.define('CArABU.app.utils.teamMetricsCalculator',{
   precision: 2,

   constructor: function(config){
      this.project = config.project || {};

      this.iterationByName = this._filterIterations(config.iterations);
      this.snapshotsByIterationOid = this._filterSnapshots(config.snapshots);
      this.calculatedData = {};
      this.daysOffsetFromIterationStart = config.daysOffsetFromIterationStart || 0;
      this.daysOffsetFromPIStart = config.daysOffsetFromPIStart || 0;
      this.release = config.release;
      this._filterIterationRevisions(config.iterationRevisions);
      this.showPIPMetrics = config.showPIPMetrics;

      this.defectTags = [];
      if (config.defectTag){
         if (!Ext.isArray(config.defectTag)){
           config.defectTag = config.defectTag.split(',');
         }
         this.defectTags = _.map(config.defectTag, function(d){
           return Rally.util.Ref.getOidFromRef(d);
         });
         //console.log('tags',this.defectTags.join(','))
      }
      this._clearData();

   },
   getProjectName: function(){
       return this.project.Name;
   },
   setDaysOffsetFromIterationStart: function(daysOffset){
      if (daysOffset != this.daysOffsetFromIterationStart){
        this.daysOffsetFromIterationStart = daysOffset;
        this._clearData();
      }
   },
   setDaysOffsetFromPIStart: function(daysOffset){
     if (daysOffset != this.daysOffsetFromPIStart){
       this.daysOffsetFromPIStart = daysOffset;
       this._clearData();
     }
   },
   _calculate: function(iterationName){
     var iteration = this.iterationByName[iterationName],
        daysOffsetFromIterationStart = this.daysOffsetFromIterationStart;

     var data = {
        plannedPoints: 0,
        acceptedPoints: 0,
        totalPointsAtSprintEnd: 0,
        blockedDays: 0,
        averageBlockedResolutionTime: 0,
        defectsClosed: 0,
        piPlanLoad: 0
     };

     var iterationPlannedObjectIDs = [],
          iterationAcceptedItems= [];

     if (!iteration){ this.calculatedData[iterationName] = {}; }

     var offsetDate = Rally.util.DateTime.add(iteration.StartDate, 'day', daysOffsetFromIterationStart),
         iterationEndDate = iteration.EndDate,
         releaseEndDate = this.release.ReleaseDate,
         pipOffsetDate = Rally.util.DateTime.add(this.release.ReleaseStartDate, 'day', this.daysOffsetFromPIStart),
         currentDate = new Date();
     var snaps = this.snapshotsByIterationOid[iteration.ObjectID] || [],
         blockedDurations = {};

    var defects = [];

     for (var i=0; i<snaps.length; i++){
       var snap = snaps[i],
         validFrom = Rally.util.DateTime.fromIsoString(snap._ValidFrom),
         validTo = Rally.util.DateTime.fromIsoString(snap._ValidTo),
         type = snap._TypeHierarchy && snap._TypeHierarchy.slice(-1)[0];

         //KMC - planned points should be 0 if the offset date is in the future.
         if (validFrom <= offsetDate && validTo > offsetDate && offsetDate <= currentDate){
            data.plannedPoints += snap.PlanEstimate;
            iterationPlannedObjectIDs.push(snap.ObjectID);
         }
         if (validFrom <= pipOffsetDate && validTo > pipOffsetDate && pipOffsetDate <= currentDate){
            data.piPlanLoad += snap.PlanEstimate;
         }
         //If the snapshot is current and has an accepted date, then
         //count it towards accepted points
         //console.log('snap.plan',iterationName, snap.PlanEstimate, validTo);
         if (validTo > new Date()  && snap.AcceptedDate.length > 0){
            data.acceptedPoints += snap.PlanEstimate;
            iterationAcceptedItems.push(snap);
         }

         if (validFrom <= iterationEndDate && validTo > iterationEndDate && iterationEndDate <= currentDate){
            data.totalPointsAtSprintEnd += snap.PlanEstimate;
         }

         if (snap.Blocked){
            var blockedDuration = this._getBlockedDuration(snap, iteration);
            if (blockedDuration > 0){
              if (!blockedDurations[snap.ObjectID]){
                  blockedDurations[snap.ObjectID] = {
                     durations: [blockedDuration],
                     currentlyBlocked: true
                  }
              } else {
                if (blockedDurations[snap.ObjectID].currentlyBlocked){
                  //add the duration to the latest duration
                  var currentDurationIdx = blockedDurations[snap.ObjectID].durations.length - 1,
                      currentDuration =  blockedDurations[snap.ObjectID].durations[currentDurationIdx];

                  blockedDurations[snap.ObjectID].durations[currentDurationIdx] = currentDuration + blockedDuration;
              } else {
                 blockedDurations[snap.ObjectID].durations.push(blockedDuration);
                 blockedDurations[snap.ObjectID].currentlyBlocked = true;
              }
            }
         }
      } else {
        if (blockedDurations[snap.ObjectID]){
          blockedDurations[snap.ObjectID].currentlyBlocked = false;
        }
      }

    if (type=='Defect' && snap.Tags && _.intersection(snap.Tags, this.defectTags).length > 0){
          if (snap.AcceptedDate && !Ext.Array.contains(defects, snap.ObjectID)){
              data.defectsClosed++;
              defects.push(snap.ObjectID);
          } else if (!snap.AcceptedDate && Ext.Array.contains(defects, snap.ObjectID)){
            //remove the defect from the closed defects
            data.defectsClosed--;
            defects = Ext.Array.remove(defects,snap.ObjectID);
          }
      }

    } //for

     var allBlockedDurations = _.reduce(blockedDurations, function(arr, obj, key){
          arr = arr.concat(obj.durations);
          return arr;
     },[]);

     //Now calculate the accepted planned ratio
     var plannedAcceptedItemsTotal = _.reduce(iterationAcceptedItems, function(total, i){
         if (_.contains(iterationPlannedObjectIDs, i.ObjectID)){
            total += i.PlanEstimate;
         }
         return total;
     }, 0);

     data.plannedAcceptedPoints = plannedAcceptedItemsTotal;

     data.blockedDays = Ext.Array.sum(allBlockedDurations);
     data.averageBlockedResolutionTime = Ext.Array.mean(allBlockedDurations);
     data.blockedDurations = allBlockedDurations;
     data.piPlanVelocity = this._calculatePIPlanVelocity(iteration, this.daysOffsetFromPIStart, this.release);
     this.calculatedData[iterationName] = data;

   },
   _calculatePIPlanVelocity: function(iteration, daysOffsetFromPIStart, release){
      var offsetDate = Rally.util.DateTime.add(release.ReleaseStartDate, 'day', daysOffsetFromPIStart);
      var iterationVelocity = 0; //If the planned velocity was set originally, then this is what the number will be

      //This assumes they are sorted in ascending order
      if (iteration.CreationDate <= offsetDate){
        _.each(iteration.__iterationPlannedVelocities, function(r){
           if (r.updateDate <= offsetDate && offsetDate <= new Date()){
              iterationVelocity = r.value;
           }
        });
      }
      return iterationVelocity;
   },

   _getBlockedDuration: function(snap, iteration){
       var validFrom = Rally.util.DateTime.fromIsoString(snap._ValidFrom),
           validTo = Rally.util.DateTime.fromIsoString(snap._ValidTo);

           if ( validFrom == validTo ) { return 0; }

           if (!iteration){ return 0;}

           if (validTo < validFrom){ //swap them
               var x = validTo;
               validTo = validFrom;
               validFrom = x;
           }

           if (validFrom > iteration.EndDate || validTo < iteration.StartDate){
              return 0;
           }

           if (validFrom < iteration.StartDate && validTo > iteration.StartDate){
                validFrom = iteration.StartDate;
           }

           if (validTo > iteration.EndDate && validFrom < iteration.EndDate){
              if (iteration.EndDate < new Date()){
                validTo = iteration.EndDate;
              } else {
                 validTo = new Date();
              }
           }
           var diff = Rally.util.DateTime.getDifference(validTo,validFrom,'hour');
         //If this wasn't blocked or unblocked on a weekend, then we want an increment of an 8-hour day
           if (diff <= 8){ //Then we want an increment of an 8-hour day
               if ((validTo.getDay() > 0 && validTo.getDay() < 6) || (validFrom.getDay() > 0 && validFrom.getDay() < 6)){
              //   console.log('getduration', snap.FormattedID, this.project.Name, iteration.Name, validFrom, validTo, diff/8);

                 return diff/8;
               }
               return 0;
           }
           //console.log('validFrom',validFrom,validTo);
           validFrom = new Date(validFrom.getFullYear(), validFrom.getMonth(), validFrom.getDate());
           validTo = new Date(validTo.getFullYear(),validTo.getMonth(),validTo.getDate());

           if (validFrom === validTo){
              return 1;
           }
           var counter = 0;
           var date_chit = validFrom;
           while ( date_chit <= validTo ) {
             var day_of_week = date_chit.getDay();
             if ( day_of_week != 0 && day_of_week != 6 ) {
                 counter++;
             }
             var next_day = Rally.util.DateTime.add(date_chit,"day",1);
             date_chit = next_day;
           }
          // console.log('getduration',  snap.FormattedID, this.project.Name, iteration.Name, validFrom, validTo, counter);

          return Math.max(counter-1,1);
   },
   getData: function(){

      if (this.data){
         return this.data;
      }

      var avgBlockerResolutionIdx = 0,
      totalBlockedDurations = [],
    //  acceptanceRatioIdx = 0,
      plannedAcceptedPointsTotal = 0,
      plannedAcceptedPoints = {name:'Planned Accepted Points', total: 0, project: this.project.Name, isPercent: false, key: 'plannedAcceptedPoints', hidden: true},
      plannedPoints = {name:'Planned Points', total: 0, project: this.project.Name, isPercent: false, key: 'plannedPoints'},
      acceptedPoints = {name:'Accepted Points', total: 0, project: this.project.Name, isPercent: false, key: 'acceptedPoints'},
      acceptanceRatio = {name:'Acceptance Ratio', total: 0, project: this.project.Name, isPercent: true, key: 'acceptanceRatio'},
      pointsAfterCommitment = {name:'Points After Commitment', total: 0, project: this.project.Name, isPercent: false, key: 'pointsAfterCommitment'},
      daysBlocked = {name:'Days Blocked', total: 0, project: this.project.Name, isPercent: false, key: 'daysBlocked'},
      avgBlockerResolution = {name:'Average Blocker Resolution', total: 0, project: this.project.Name, isPercent: false, key: 'avgBlockerResolution'},
      defectsClosedByTag = {name:'Live Defects Closed', total: 0, project: this.project.Name, isPercent: false, key: 'defectsClosedByTag'},
      piVelocityPlanned = {name:'PIP Velocity', total: 0, project: this.project.Name, isPercent: false, key: 'piVelocityPlanned'},
      piLoadPlanned = {name:'PIP Load', total: 0, project: this.project.Name, isPercent: false, key: 'piLoadPlanned'},
      plannedAcceptanceRatio = {name:'Planned Acceptance Ratio', total: 0, project: this.project.Name, isPercent: true, key: 'plannedAcceptanceRatio'};

      var idx = 0;
        Ext.Object.each(this.iterationByName, function(key,i){
           var dataIndex = key.toString();

           plannedPoints[dataIndex] = this.getPlannedPoints(key);
           plannedPoints.total += plannedPoints[dataIndex];

           acceptedPoints[dataIndex] = this.getAcceptedPoints(key);
           acceptedPoints.total += acceptedPoints[dataIndex];

           acceptanceRatio[dataIndex] = this.getAcceptanceRatio(key);

           //plannedAcceptedPointsTotal += this.getPlannedAcceptedPoints(key);
           plannedAcceptedPoints.total += this.getPlannedAcceptedPoints(key);
           plannedAcceptanceRatio[dataIndex] = this.getPlannedAcceptanceRatio(key);

           pointsAfterCommitment[dataIndex] = this.getPointsAddedAfterCommitment(key);
           pointsAfterCommitment.total += Math.max(pointsAfterCommitment[dataIndex] || 0,0);

           daysBlocked[dataIndex] = this.getDaysBlocked(key) || 0;
           daysBlocked.total += daysBlocked[dataIndex];


           avgBlockerResolution[dataIndex] = this.getAverageBlockerResolution(key);
           if (avgBlockerResolution[dataIndex]){
              avgBlockerResolution.total += avgBlockerResolution[dataIndex];
              avgBlockerResolutionIdx++;
           }
           defectsClosedByTag[dataIndex] = this.getDefectsClosedByTag(key);
           defectsClosedByTag.total += defectsClosedByTag[dataIndex];

           piVelocityPlanned[dataIndex] = this.getPIPVelocityPlanned(key);
           piVelocityPlanned.total += piVelocityPlanned[dataIndex];

           piLoadPlanned[dataIndex] = this.getPIPLoadPlanned(key);
           piLoadPlanned.total += piLoadPlanned[dataIndex];

           totalBlockedDurations = totalBlockedDurations.concat(this.getBlockedDurations(key));

        },this);

        // if (daysBlocked.total){
        //    daysBlocked.total = Math.round(daysBlocked.total * 100)/100;
        // }
        avgBlockerResolution.total = Ext.Array.mean(totalBlockedDurations) || 0; //avgBlockerResolutionIdx > 0 ? avgBlockerResolution.total/avgBlockerResolutionIdx: 0;
        acceptanceRatio.total = plannedPoints.total > 0 ? acceptedPoints.total/plannedPoints.total : 0;
        plannedAcceptanceRatio.total = plannedPoints.total > 0 ? plannedAcceptedPoints.total/plannedPoints.total : 0;

        this.data = [
          plannedPoints,
          acceptedPoints,
          acceptanceRatio,
          plannedAcceptedPoints,
          plannedAcceptanceRatio,
          pointsAfterCommitment,
          daysBlocked,
          avgBlockerResolution,
          defectsClosedByTag
        ];

        if (this.showPIPMetrics){
            this.data = this.data.concat([piVelocityPlanned,piLoadPlanned]);
        }

       return this.data;
   },
   getDisplayedData: function(){

     var data = this.getData(),
          displayedData = Ext.Array.filter(data, function(d){
        return !d.hidden;
     });
     return displayedData;
   },
   _getTotal: function(key){
     var data = this.getData();
     var obj = _.find(data,function(d){ return d.key == key; });
     return obj && obj.total;
   },

   getPlannedPointsTotal: function(){
     return this._getTotal('plannedPoints');
   },
   getPlannedAcceptedPointsTotal: function(){
     return this._getTotal('plannedAcceptedPoints');
   },
   getPlannedAcceptanceRatioTotal: function(){
     return this._getTotal('plannedAcceptanceRatio');
   },
   getAcceptedPointsTotal: function(){
     return this._getTotal('acceptedPoints');
   },
   getAcceptanceRatioTotal: function(){
     return this._getTotal('acceptanceRatio');
   },
   getPointsAfterCommitmentTotal: function(){
      return this._getTotal('pointsAfterCommitment');
   },
   getDaysBlockedTotal: function(){
     return this._getTotal('daysBlocked');
   },
   getBlockerResolutionTotal: function(){
     return this._getTotal('avgBlockerResolution');
   },
   getDefectsClosedTotal: function(){
     return this._getTotal('defectsClosedByTag');
   },
   getPIPlanVelocityTotal: function(){
     return this._getTotal('piVelocityPlanned');
   },
   getPIPlanLoadTotal: function(){
     return this._getTotal('piLoadPlanned');
   },
   getBlockedDurations: function(iterationName){
      if (!this.calculatedData[iterationName]){
         this._calculate(iterationName);
      }
      return this.calculatedData[iterationName].blockedDurations || 0;
   },
   getPlannedPoints: function(iterationName){
      if (!this.calculatedData[iterationName]){
         this._calculate(iterationName);
      }
      return this.calculatedData[iterationName].plannedPoints || 0;
   },
   getAcceptedPoints: function(iterationName){
     if (!this.calculatedData[iterationName]){
        this._calculate(iterationName);
     }
     return this.calculatedData[iterationName].acceptedPoints || 0;
   },
   getAcceptanceRatio: function(iterationName){
     if (!this.calculatedData[iterationName]){
        this._calculate(iterationName);
     }

     return this.calculatedData[iterationName].plannedPoints > 0 ?
          this.calculatedData[iterationName].acceptedPoints / this.calculatedData[iterationName].plannedPoints : 0;
   },
   getPlannedAcceptanceRatio: function(iterationName){
     if (!this.calculatedData[iterationName]){
        this._calculate(iterationName);
     }

     return this.calculatedData[iterationName].plannedPoints > 0 ?
          this.calculatedData[iterationName].plannedAcceptedPoints / this.calculatedData[iterationName].plannedPoints : 0;

   },
   getPlannedAcceptedPoints: function(iterationName){
     if (!this.calculatedData[iterationName]){
        this._calculate(iterationName);
     }
     return this.calculatedData[iterationName].plannedAcceptedPoints || 0;
   },
   getPointsAddedAfterCommitment: function(iterationName){
     if (!this.calculatedData[iterationName]){
        this._calculate(iterationName);
     }
     return Math.max(this.calculatedData[iterationName].acceptedPoints - this.calculatedData[iterationName].plannedPoints || 0, 0);
     //return Math.max(this.calculatedData[iterationName].totalPointsAtSprintEnd - this.calculatedData[iterationName].plannedPoints || 0, 0);
   },
   getDaysBlocked: function(iterationName){
     if (!this.calculatedData[iterationName]){
        this._calculate(iterationName);
     }
     return this.calculatedData[iterationName].blockedDays || 0;
   },
   getAverageBlockerResolution: function(iterationName){
     if (!this.calculatedData[iterationName]){
        this._calculate(iterationName);
     }
     return this.calculatedData[iterationName].averageBlockedResolutionTime || 0;
   },
   getDefectsClosedByTag: function(iterationName){
     if (!this.calculatedData[iterationName]){
        this._calculate(iterationName);
     }
     return this.calculatedData[iterationName].defectsClosed || 0;
   },
   getPIPVelocityPlanned: function(iterationName){
     if (!this.calculatedData[iterationName]){
        this._calculate(iterationName);
     }
     return Number(this.calculatedData[iterationName].piPlanVelocity) || 0;
   },
   getPIPLoadPlanned: function(iterationName){
     if (!this.calculatedData[iterationName]){
        this._calculate(iterationName);
     }
     return this.calculatedData[iterationName].piPlanLoad || 0;
   },
   /*
      This private method takes the passed snapshots and filters them for only the relevant ones
      for this team.

   */
   _filterSnapshots: function(snapshots){
       var thisProject = this.project.ObjectID;
       return _.reduce(snapshots, function(sHash, s){
         var project = s.get('Project').ObjectID;

         if (project === thisProject){
           var iteration = s.get('Iteration');

           if (!sHash[iteration]){
              sHash[iteration] = [];
           }
           sHash[iteration].push(s.getData());
         }
         return sHash;
       },{});
   },
   _filterIterations: function(iterations){
     var thisProject = this.project.ObjectID;
     return _.reduce(iterations, function(iHash, i){
       var project = i.get('Project') && i.get('Project').ObjectID;
       if (project === thisProject){
         var key = i.get('Name').replace(/[^a-z0-9]/gi, " ");
         iHash[key] = i.getData();
       }
       return iHash;
     },{});
   },
   _filterIterationRevisions: function(iterationRevisions){
      if (!iterationRevisions || iterationRevisions.length == 0){
        return;
      }

      var revByID = _.reduce(iterationRevisions, function(hash, ir){
          var id = ir.get('RevisionHistory') && ir.get('RevisionHistory').ObjectID;
          if (id){
              if (!hash[id]){
                  hash[id] = [];
              }
              hash[id].push(ir.getData());
          }
          return hash;
      },{});

      _.each(this.iterationByName, function(i){
         var rID = i.RevisionHistory && i.RevisionHistory.ObjectID;
         var revisions = revByID[rID] || [];
         i.__iterationPlannedVelocities = this._calculateIterationVelocities(i, revisions);
      }, this);

   },
   _calculateIterationVelocities: function(iteration, revisions){
      if (revisions.length == 0){
        return [{
          updateDate: iteration.CreationDate,
          plannedVelocity: iteration.PlannedVelocity || 0
        }]
      }
      var plannedVelocities = [{
        updateDate: iteration.CreationDate,
        plannedVelocity: 0
      }],
      idx = 0;

      //  PLANNED VELOCITY added [57.0 Points]
      //  2	PLANNED VELOCITY removed [67.0 Points]
      //  1	PLANNED VELOCITY changed from [77.0 Points] to [67.0 Points]
      var re = new RegExp(/PLANNED VELOCITY (added|removed) \[([0-9]*\.[0-9]*) Points\]/g),
          reChanged = new RegExp(/PLANNED VELOCITY (changed from) \[([0-9]*\.[0-9]*) Points\] to \[([0-9]*\.[0-9]*) Points\]/g)

      _.each(revisions, function(r){
          var d = r.Description;
          var ar = re.exec(r.Description);
          if (ar){

             if (ar[1] == 'removed'){
                 plannedVelocities[idx].plannedVelocity = ar[2];
                 plannedVelocities.push({
                   updateDate: r.CreationDate,
                   value: 0
                 });
                 idx++;
             } else {
               plannedVelocities.push({
                 updateDate: r.CreationDate,
                 value: ar[2]
               });
               idx++;
             }
          } else {
             c = reChanged.exec(r.Description);


             if (c){
               plannedVelocities[idx].plannedVelocity = c[2];
               plannedVelocities.push({
                 updateDate: r.CreationDate,
                 value: c[3]
               });
               idx++;
             }

          }
      });
      return plannedVelocities;

   },
   _clearData: function(){
     this.data = null;
     this.calculatedData = {};
   }

});
