Ext.define("CArABU.app.safeDeliveryMetrics", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new CArABU.technicalservices.Logger(),
    defaults: { margin: 10 },
    //  layout: 'border',
    //  defaults: {
    //      collapsible: true,
    //      split: true,
    //      bodyPadding: 15
    //  },
    layout: {
    // layout-specific configs go here
      type: 'accordion',
      titleCollapse: false,
      animate: true,
      activeOnTop: true
    },
    integrationHeaders : {
        name : "CArABU.app.TSApp"
    },

    launch: function() {
      this.logger.log('this.', this._hasScope())
      if (!this._hasScope()){
        this._addAppMessage("This app is designed to run on a Release scoped dashboard.<br/><br/>Please select <em>Edit Page...</em> from the Page Settings and set the <em>Show Filter</em> setting to Release.");
        return;
      }
      this._update();
    },
    _update: function(){

       this.removeAll();
       var release = this.getReleaseTimeboxRecord();
       this.logger.log('_update ', release);
       if (!release){
           this._addAppMessage("Please select a Release.");
           return;
       }
       this.setLoading(true);
       Deft.Chain.pipeline([
         this._fetchIterations,
         this._fetchReleases,
         this._fetchSnapshots
       ],this,{}).then({
          success: this._buildDisplay,
          failure: this._showErrorNotification,
          scope: this
       }).always(function(){
          this.setLoading(false);
       },this);
    },
    _showErrorNotification: function(msg){
       Rally.ui.notify.Notifier.showError({message: msg});
    },
    _fetchReleases: function(data){
        var deferred = Ext.create('Deft.Deferred');
        this.logger.log('_fetchReleases',data);
        var release = this.getReleaseTimeboxRecord(),
            filters = [{
              property: 'Name',
              value: release.get('Name')
            },{
              property: 'ReleaseStartDate',
              value: release.get('ReleaseStartDate')
            },{
              property: 'ReleaseDate',
              value: release.get('ReleaseDate')
            }];

        Ext.create('Rally.data.wsapi.Store',{
           model: 'Release',
           filters: filters,
           fetch: ['ObjectID','Project','Name'],
           limit: 'Infinity',
           pageSize: 2000
        }).load({
           callback: function(records,operation){
              if (operation.wasSuccessful()){
                data.releases = records;
                deferred.resolve(data);
              } else {
                deferred.reject('ERROR loading Releases: ' + operation.error && operation.error.errors.join(','));
              }
           }
        });

        return deferred.promise;
    },
    _fetchIterations: function(data){
      var deferred = Ext.create('Deft.Deferred');

      var release = this.getReleaseTimeboxRecord(),
          filters = [{
            property: 'EndDate',
            operator: '>',
            value: release.get('ReleaseStartDate')
          },{
            property: 'StartDate',
            operator: '<',
            value: release.get('ReleaseDate')
          }];

      Ext.create('Rally.data.wsapi.Store',{
         model: 'Iteration',
         filters: filters,
         fetch: ['ObjectID','Project','Name','StartDate','EndDate'],
         limit: 'Infinity',
         pageSize: 2000
      }).load({
         callback: function(records,operation){
            if (operation.wasSuccessful()){
              data.iterations = records;
              deferred.resolve(data);
            } else {
              deferred.reject('ERROR loading ITerations: ' + operation.error && operation.error.errors.join(','));
            }
         }
      });

      return deferred.promise;
    },
    _fetchSnapshots: function(data){
       var deferred = Ext.create('Deft.Deferred');


       var releaseOids = _.map(data.releases, function(r){
          return r.get('ObjectID');
       });
       this.logger.log('_fetchSnapshots ', releaseOids);

       var earliestDate = this.getReleaseTimeboxRecord().get('ReleaseStartDate'),
          latestDate = this.getReleaseTimeboxRecord().get('ReleaseDate');

       Ext.create('Rally.data.lookback.SnapshotStore',{
         fetch: ['ObjectID','Project','Iteration','PlanEstimate','AcceptedDate','Blocked','_ValidFrom','_ValidTo','_TypeHierarchy'],
         find:{
           "_TypeHierarchy": {$in: ['Defect','HierarchicalRequirement']},
           "Release": {$in: releaseOids},
           "_ValidTo": {$gte: earliestDate},
           "_ValidFrom": {$lte: latestDate},
           "_ProjectHierarchy": this.getContext().getProject().ObjectID
          },
          hydrate: ['_TypeHierarchy','Project'],
          limit: 'Infinity',
          removeUnauthorizedSnapshots: true
       }).load({
          callback: function(records, operation){
              if (operation.wasSuccessful()){
                  data.snapshots = records;
                  deferred.resolve(data);
              } else {
                  deferred.reject("Error loading snapshots: " + operation.error && operation.error.errors.join(','));
              }
          }
       });

       return deferred.promise;
    },
    _buildDisplay: function(data){
      this.logger.log('_buildDisplay',data);

      var items = [],
          newData = [];
      _.each(data.releases, function(r){
          var project = r.get('Project');
          var calc = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
             project: project,
             iterations: data.iterations,
             snapshots: data.snapshots
          });

          //newData = newData.concat(calc.getData());
          items.push(this._addTeamGrid(calc.getData(), project.Name));
          console.log('project',project);
      }, this);

      this.add({
        xtype:'panel',
        height: items.length * 400,
        autoScroll: true,
        items: items,
        title: 'Teams',
        // region: 'center',
        // collapsible: true,
        // collapseMode: 'header',
        // resizable: true
      });

      this.add({
        xtype:'panel',
        height: 600,
        autoScroll: true,
        title: "Summary",
      //   region: 'west',
      //   collapsed: true ,
      //   maxWidth: '100%',
      //  resizable: true ,
        items: [this._getSummaryGrid(data)]
      });

      //return this.add(this._addGroupedTeamGrid(newData));


      // this.add({
      //    xtype: 'summarypanel',
      //    //region: 'north',
      //    releases: data.releases,
      //    iterations: data.iterations,
      //    snapshots: data.snapshots
      // });

      // this.add({
      //    xtype: 'teamdetailpanel',
      //   // region: 'center',
      //    releases: data.releases,
      //    iterations: data.iterations,
      //    snapshots: data.snapshots
      // });

    },
    _getSummaryGrid: function(data){
      var newData = [];
      _.each(data.releases, function(r){
          var project = r.get('Project').Name;
         newData.push({
           project: project,
           pointsPlanned: 1,
           pointsAccepted: 1,
           acceptanceRatio: 1,
           pointsAdded: 0,
           daysBlocked: 0,
           blockerResolution: 0,
           defectsClosed: 0
         });
      });
      this.logger.log('data',newData, data);

      var store = Ext.create('Rally.data.custom.Store',{
             fields: ['project','pointsPlanned','pointsAccepted','acceptanceRatio','testCases','automatedTestCases','pctTestsAutomated','pointsAdded','daysBlocked','blockerResolution','defectsClosed'],
             data: newData,
             pageSize: data.length
          });

        return Ext.widget({
          xtype:'rallygrid',
          store: store,
          features: [{
            ftype: 'summary'
          }],
          columnCfgs: this._getSummaryColumnCfgs(data),
          showPagingToolbar: false,
          showRowActionsColumn: false
        });
    },
    _addTeamGrid: function(data, project){

      var fields = Ext.Object.getKeys(data[0]),
          store = Ext.create('Rally.data.custom.Store',{
             //fields: fields,
             data: data,
             pageSize: data.length
          });

        return Ext.widget({
          xtype:'rallygrid',
          store: store,
          title: project,
          margin: '15 0 25 0',

          //height: 300,
        //  flex: 1,
          columnCfgs: this._getColumnCfgs(data),
          showPagingToolbar: false,
          showRowActionsColumn: false
        });
    },
    _addGroupedTeamGrid: function(data){
      var fields = Ext.Object.getKeys(data[0]),
          store = Ext.create('Rally.data.custom.Store',{
             //fields: fields,
             data: data,
             pageSize: data.length,
             groupField: 'project'
          });


        return Ext.widget({
          xtype:'rallygrid',
          store: store,
          //title: project,
          features: {ftype: 'grouping'},
          //height: 300,
          columnCfgs: this._getColumnCfgs(data),
          groupHeaderTpl: '{name}',
          showPagingToolbar: false,
          showRowActionsColumn: false
        });
    },
    _getColumnCfgs: function(data){
        var cols = [{
           dataIndex: 'name',
           text: 'Metric',
           flex: 1
        }];

        _.each(Ext.Object.getKeys(data[0]),function(key){
           if (key !== 'name' && key !== 'total' && key !== 'project'){
             cols.push({
               dataIndex: key,
               text: key
             });
           }
        });

        cols.push({
          dataIndex: 'total',
          text: 'Total'
        });

        return cols;
    },
    _getSummaryColumnCfgs: function(data){
        var cols = [{
           dataIndex: 'project',
           text: 'Team',
           flex: 1,
           summaryType: 'count',
           summaryRenderer: function(value, summaryData, dataIndex) {
            return Ext.String.format('<div class="app-summary">{0} Team{1} Total</div>', value, value !== 1 ? 's' : '');
          }
        },{
           dataIndex: 'pointsPlanned',
           text: 'Points Planned',
           summaryType: 'sum'
        },{
           dataIndex: 'pointsAccepted',
           text: 'Points Accepted',
           summaryType: 'sum'
        },{
           dataIndex: 'acceptanceRatio',
           text: 'Point Acceptance Rate',
           renderer: function(v){
              return Math.round(v*100) + '%';
           },
           summaryType: 'average'
        },{
          dataIndex: 'testCases',
          text: '# Test Cases',
          summaryType: 'sum'
        },{
          dataIndex: 'automatedTestCases',
          text: '# Automated Test Cases',
          summaryType: 'sum'
        },{
          dataIndex: 'pctTestsAutomated',
          text: '% Tests Automated',
          summaryType: 'average'
        },{
           dataIndex: 'daysBlocked',
           text: 'Days Blocked',
           summaryType: 'sum'
        },{
           dataIndex: 'blockerResolution',
           text: 'Average Days to Resolve Blockers',
           summaryType: 'sum'
        },{
          dataIndex: 'defectsClosed',
          text: 'Total number of SIs Closed',
          summaryType: 'sum'
        }];

        return cols;
    },
    _addAppMessage: function(msg){
        this.add({
           html: Ext.String.format('<div class="app-msg">{0}</div>',msg),
           xtype: 'panel',
           layout: 'fit',
           frameHeader: false,
           region: 'north'
        });
    },
    _hasScope: function() {
        var context = this.getContext();
        return context.getTimeboxScope() && context.getTimeboxScope().getType().toLowerCase() === 'release';
    },

    onTimeboxScopeChange: function(timebox){
        this.logger.log('onTimeboxScopeChange', timebox);
        if (timebox && timebox.type.toLowerCase() === 'release'){
            this.getContext().setTimeboxScope(timebox);
            this._update();
        }
    },
    getReleaseTimeboxRecord: function(){
        if (this._hasScope()){
            return (this.getContext().getTimeboxScope() && this.getContext().getTimeboxScope().getRecord()) || null;
        }
        return null;
    },
    getSettingsFields: function() {
        var check_box_margins = '5 0 5 0';
        return [{
            name: 'saveLog',
            xtype: 'rallycheckboxfield',
            boxLabelAlign: 'after',
            fieldLabel: '',
            margin: check_box_margins,
            boxLabel: 'Save Logging<br/><span style="color:#999999;"><i>Save last 100 lines of log for debugging.</i></span>'

        }];
    },

    getOptions: function() {
        var options = [
            {
                text: 'About...',
                handler: this._launchInfo,
                scope: this
            }
        ];

        return options;
    },

    _launchInfo: function() {
        if ( this.about_dialog ) { this.about_dialog.destroy(); }

        this.about_dialog = Ext.create('Rally.technicalservices.InfoLink',{
            showLog: this.getSetting('saveLog'),
            logger: this.logger
        });
    },

    isExternal: function(){
        return typeof(this.getAppId()) == 'undefined';
    }

});
