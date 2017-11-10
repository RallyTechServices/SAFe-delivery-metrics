Ext.define('CArABU.app.utils.teamMetricsCalculator',{
   constructor: function(config){
      this.project = config.project || {};

      this.iterationByName = this._filterIterations(config.iterations);
      this.snapshotsByIterationOid = this._filterSnapshots(config.snapshots);
      this.calculatedData = {};
      this.hoursOffsetFromIterationStart = config.hoursOffsetFromIterationStart || 0;
      console.log('iterations', this.iterationByName, this.snapshotsByIterationOid);
   },
   setHoursOffsetFromIterationStart: function(hoursOffset){
      if (hoursOffset != this.hoursOffsetFromIterationStart){
        this.hoursOffsetFromIterationStart = hoursOffset;
        this.calculatedData = {};
      }
   },
   _calculate: function(iterationName){
     var iteration = this.iterationByName[iterationName],
        hoursOffsetFromIterationStart = this.hoursOffsetFromIterationStart;

     var data = {
        plannedPoints: 0,
        acceptedPoints: 0
     };

     if (!iteration){ this.calculatedData[iterationName] = {}; }

     var offsetDate = Rally.util.DateTime.add(iteration.StartDate, 'hour', hoursOffsetFromIterationStart);
     var snaps = this.snapshotsByIterationOid[iteration.ObjectID] || [];

     for (var i=0; i<snaps.length; i++){
       var snap = snaps[i],
         validFrom = Rally.util.DateTime.fromIsoString(snap._ValidFrom),
         validTo = Rally.util.DateTime.fromIsoString(snap._ValidTo);
         
         if (validFrom <= offsetDate && validTo > offsetDate){
            data.plannedPoints += snap.PlanEstimate;
         }
         //If the snapshot is current and has an accepted date, then
         //count it towards accepted points
         if (validTo > new Date() && snap.AcceptedDate.length > 0){
            data.acceptedPoints += snap.PlanEstimate;
         }
     }

     this.calculatedData[iterationName] = data;

   },
   getData: function(){

      var defectTag = 'xx',
      plannedPoints = {name:'Planned Points', total: 0, project: this.project.Name},
      acceptedPoints = {name:'Accepted Points', total: 0, project: this.project.Name},
      acceptanceRatio = {name:'Acceptance Ratio', total: 0, project: this.project.Name},
      pointsAfterCommitment = {name:'Points After Commitment', total: 0, project: this.project.Name},
      daysBlocked = {name:'Days Blocked', total: 0, project: this.project.Name},
      avgBlockerResolution = {name:'Average Blocker Resolution', total: 0, project: this.project.Name},
      defectsClosedByTag = {name:'Defects Closed', total: 0, project: this.project.Name},
      piVelocityPlanned = {name:'PIP Velocity', total: 0, project: this.project.Name},
      piLoadPlanned = {name:'PIP Load', total: 0, project: this.project.Name};
      var idx = 0;
        Ext.Object.each(this.iterationByName, function(key,i){
           var dataIndex = key;
           plannedPoints[dataIndex] = this.getPlannedPoints(key);
           acceptedPoints[dataIndex] = this.getAcceptedPoints(key);
           acceptanceRatio[dataIndex] = this.getAcceptanceRatio(key);
           pointsAfterCommitment[dataIndex] = this.getPointsAddedAfterCommitment(key);
           daysBlocked[dataIndex] = this.getDaysBlocked(key);
           avgBlockerResolution[dataIndex] = this.getAverageBlockerResolution(key);
           defectsClosedByTag[dataIndex] = this.getDefectsClosedByTag(key, defectTag);
           piVelocityPlanned[dataIndex] = this.getPIPVelocityPlanned(key);
           piLoadPlanned[dataIndex] = this.getPIPLoadPlanned(key);

        },this);
        return [
          plannedPoints,
          acceptedPoints,
          acceptanceRatio,
          pointsAfterCommitment,
          daysBlocked,
          avgBlockerResolution,
          defectsClosedByTag,
          piVelocityPlanned,
          piLoadPlanned
        ];
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
   getPointsAddedAfterCommitment: function(iterationName){
      return 1;
   },
   getDaysBlocked: function(iterationName){
     return 1;
   },
   getAverageBlockerResolution: function(iterationName){
     return 1;
   },
   getDefectsClosedByTag: function(iterationName, tag){
     return 1;
   },
   getPIPVelocityPlanned: function(iterationName){
     return 1;
   },
   getPIPLoadPlanned: function(iterationName){
     return 1;
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
         iHash[i.get('Name')] = i.getData();
       }
       return iHash;
     },{});
   }

});
