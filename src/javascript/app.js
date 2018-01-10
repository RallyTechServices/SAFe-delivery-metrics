Ext.define("CArABU.app.safeDeliveryMetrics", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new CArABU.technicalservices.Logger(),
    defaults: { margin: 10 },

    integrationHeaders : {
        name : "CArABU.app.TSApp"
    },
    config: {
      defaultSettings: {
        daysOffsetFromIterationStart: 0,
        defectTag: null,
        daysOffsetFromPIStart: 0,
        precision: 2,
        showPIPMetrics: true
      }
    },

    releaseFetchList: ['ObjectID','Project','Name','ReleaseStartDate','Children'],

    launch: function() {
      this.logger.log('this.', this._hasScope(), this.getSettings());
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
         this._fetchIterationRevisions,
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
            },{
              property: 'Project.Children.ObjectID',  //This is only going to get leaf projects
              value: ""
            }];

        Ext.create('Rally.data.wsapi.Store',{
           model: 'Release',
           filters: filters,
           fetch: this.releaseFetchList,
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
          },{
            property: 'Project.Children.ObjectID',
            value: ""
          }];

      Ext.create('Rally.data.wsapi.Store',{
         model: 'Iteration',
         filters: filters,
         fetch: ['ObjectID','Project','Name','StartDate','EndDate','RevisionHistory','PlannedVelocity','CreationDate'],
         limit: 'Infinity',
         pageSize: 2000,
         sorters: [{
            property: 'StartDate',
            direction: 'ASC'
         }]
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
    _fetchIterationRevisions: function(data){
      var deferred = Ext.create('Deft.Deferred');

      if (!this.getShowPIPMetrics()){
        data.iterationRevisions = [];
        deferred.resolve(data);

      } else {
        var filters = _.map(data.iterations, function(i){
            return {
               property: 'RevisionHistory.ObjectID',
               value: i.get('RevisionHistory').ObjectID
            };
        });
        filters = Rally.data.wsapi.Filter.or(filters);
        this.logger.log('filters', filters.toString());
        filters = filters.and({
            property: 'Description',
            operator: 'contains',
            value: 'PLANNED VELOCITY'
        });

        Ext.create('Rally.data.wsapi.Store',{
           model: 'Revision',
           filters: filters,
           fetch: ['ObjectID','RevisionHistory','Description','CreationDate'],
           limit: 'Infinity',
           pageSize: 2000,
           enablePostGet: true,
           sorters: [{
              property: 'CreationDate',
              direction: 'ASC'
           }]
        }).load({
           callback: function(records,operation){
              if (operation.wasSuccessful()){
                data.iterationRevisions = records;
                deferred.resolve(data);
              } else {
                deferred.reject('ERROR loading iteration revisions: ' + operation.error && operation.error.errors.join(','));
              }
           }
        });
      }
      return deferred.promise;
    },
    _fetchSnapshots: function(data){
       var deferred = Ext.create('Deft.Deferred');
       var earliestDate = new Date('2999-01-01'),
          latestDate = new Date('1900-01-01'),
          timeboxOids = [];
       _.each(data.iterations, function(r){
          if (r.get('StartDate') < earliestDate){
             earliestDate = r.get('StartDate');
          }
          if (r.get('EndDate') > latestDate){
             latestDate = r.get('EndDate');
          }
          timeboxOids.push(r.get('ObjectID'));
       });
       this.logger.log('_fetchSnapshots -- ', timeboxOids, earliestDate, latestDate);

      //  var earliestDate = this.getReleaseTimeboxRecord().get('ReleaseStartDate'),
      //     latestDate = this.getReleaseTimeboxRecord().get('ReleaseDate');

       Ext.create('Rally.data.lookback.SnapshotStore',{
         fetch: ['FormattedID','ObjectID','Project','Iteration','PlanEstimate','AcceptedDate','Blocked','_ValidFrom','_ValidTo','_TypeHierarchy','Tags'],
         find:{
           "_TypeHierarchy": {$in: ['Defect','HierarchicalRequirement']},
           "Iteration": {$in: timeboxOids},
           "_ValidTo": {$gte: earliestDate},
           //"_ValidFrom": {$lte: latestDate},
           "_ProjectHierarchy": this.getContext().getProject().ObjectID //This probably isn't needed since the iterations are specified
          },
          hydrate: ['_TypeHierarchy','Project'],
          limit: 'Infinity',
          removeUnauthorizedSnapshots: true,
          sort: { "_ValidFrom": 1 }
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
          newData = [],
          calcs = [];

      var releases = _.sortBy(data.releases, function(r){
         return r.get('Project').Name;
      });
      _.each(releases, function(r){
          var project = r.get('Project');
          var calc = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
             project: project,
             release: r.getData(),
             iterations: data.iterations,
             snapshots: data.snapshots,
             iterationRevisions: data.iterationRevisions,
             daysOffsetFromIterationStart: this.getdaysOffsetFromIterationStart(),
             daysOffsetFromPIStart: this.getDaysOffsetFromPIStart(),
             defectTag: this.getDefectTag(),
             showPIPMetrics: this.getShowPIPMetrics()
          });

          //newData = newData.concat(calc.getData());
          items.push(this._addTeamGrid(calc.getDisplayedData(), project.Name));
          calcs.push(calc);
      }, this);

      this.add({
         xtype: 'container',
         layout: {
           type:'hbox',
           pack: 'end'
         },
         items: [{
           xtype: 'rallybutton',
           iconCls: 'icon-export',
           cls: 'secondary rly-small',
           handler: this._export,
           scope: this
         },{
           xtype: 'rallybutton',
           text: 'Teams',
           itemId: 'teamsBtn',
           margin: '0 0 0 25',
           pressed: true,
           cls: 'primary rly-small',
           toggleGroup: 'tabView',
           toggleHandler: this._tabChange,
           style: {
              borderBottomRightRadius: 0,
              borderTopRightRadius: 0
           },
           scope: this
         },{
           xtype: 'rallybutton',
           text: 'Summary',
           itemId: 'summaryBtn',
           margin: '0 25 0 0',
           cls: 'secondary rly-small',
           toggleGroup: 'tabView',
           style: {
              borderBottomLeftRadius: 0,
              borderTopLeftRadius: 0
           },
           toggleHandler: this._tabChange,
           scope: this
         }]
      });

      var tabs = Ext.create('Ext.tab.Panel', {
          layout: 'fit',
          overflowX: 'hidden',
          overflowY: 'hidden',
          activeTab: 0,
          itemId: 'tabs',
          tabBar: {
             hidden: true
          },
          border: false,
          items: [
              {
                  xtype : 'panel',
                  overflowY: 'hidden',
                  border: false,
                  //cls: 'fieldBucket',
                  itemId: 'teamsTab',
                  padding: '8px 0 0 0',
                  items: items,
                  title: 'Teams',
              },{
                  xtype:'panel',
                  overflowY: 'hidden',
                  title: "Summary",
                  border: false,
                //  cls: 'fieldBucket',
                   itemId: 'summaryTab',
                   padding: '8px 0 0 0',
                   items: [this._getSummaryGrid(calcs)]
              }
          ]
      });
      this.add(tabs);

    },
    _tabChange: function(btn, pressed){
       this.logger.log('_tabChange',btn, pressed);
       if (pressed){
         btn.addCls('primary');
         btn.removeCls('secondary');
         this.down('#tabs').setActiveTab(btn.itemId.replace('Btn','Tab'));
       } else {
         btn.addCls('secondary');
         btn.removeCls('primary');
       }
    },
    _export: function(){
        var activeTab = this.down('#tabs').getActiveTab().itemId;
        if (activeTab === 'teamsTab'){
           this._exportTeams();
        } else {
           this._exportSummary();
        }
    },
    _exportTeams: function(){
      this.logger.log('_exportTeams');
      var grids = this.down('#teamsTab').query('rallygrid'),
          csv = [];
      _.each(grids, function(grid){
          var cols = grid.getColumnCfgs();
          var headers = ['Team'].concat(_.pluck(cols,'text'));
          csv.push('"' + headers.join('","') + '"');
          grid.getStore().each(function(r){
              var row = [grid.title];
              _.each(cols, function(c){
                 row.push(r.get(c.dataIndex));
              });
              csv.push(row.join(','));
          });
          csv.push("");
      });
      var fileName = Ext.String.format('team-detail-{0}.csv', Rally.util.DateTime.format(new Date(),'Y-m-d-h-i-s'));
      TSUtilities.saveCSVToFile(csv.join('\r\n'),fileName);
    },
    _exportSummary: function(){
      this.logger.log('_exportSummary');
      var grid = this.down('#summaryTab').query('rallygrid'),
          csv = [];

      if (grid && grid.length > 0){
         grid = grid[0];
         var cols = grid.getColumnCfgs();
         var headers = _.pluck(cols,'text');
         csv.push('"' + headers.join('","') + '"');

         grid.getStore().each(function(r){
             var row = _.map(cols, function(c){
                return r.get(c.dataIndex);
             });
             csv.push(row.join(','));
         });
         var fileName = Ext.String.format('summary-{0}.csv', Rally.util.DateTime.format(new Date(),'Y-m-d-h-i-s'));
         TSUtilities.saveCSVToFile(csv.join('\r\n'),fileName);
      }
    },
    _getSummaryGrid: function(calcs){
      var newData = [];
      _.each(calcs, function(c){
         var project = c.project;
         var row = {
           project: project.Name,
           plannedPoints: c.getPlannedPointsTotal(),
           plannedAcceptedPoints: c.getPlannedAcceptedPointsTotal(),
           pointsAccepted: c.getAcceptedPointsTotal(),
           acceptanceRatio: c.getAcceptanceRatioTotal(),
           plannedAcceptanceRatio: c.getPlannedAcceptanceRatioTotal(),
           pointsAdded: c.getPointsAfterCommitmentTotal(),
           daysBlocked: c.getDaysBlockedTotal(),
           blockerResolution: c.getBlockerResolutionTotal(),
           defectsClosed: c.getDefectsClosedTotal(),
           piPlanVelocity: c.getPIPlanVelocityTotal(),
           piPlanLoad: c.getPIPlanLoadTotal()
         };

         // if (this.getShowPIPMetrics()){
         //    row.piPlanVelocity = c.getPIPlanVelocityTotal();
         //    row.piPlanLoad = c.getPIPlanLoadTotal();
         // }
         newData.push(row);
      });
      this.logger.log('data',newData);

      var store = Ext.create('Rally.data.custom.Store',{
             fields: Ext.Object.getKeys(newData[0]),
             data: newData,
             pageSize: newData.length
          });

        return Ext.widget({
          xtype:'rallygrid',
          store: store,
          title: "Summary",
          features: [{
            ftype: 'summary'
          }],
          columnCfgs: this._getSummaryColumnCfgs(newData),
          showPagingToolbar: false,
          showRowActionsColumn: false,
          margin: '25 0 25 0'
        });
    },
    _addTeamGrid: function(data, project){
      this.logger.log('_addTeamGrid', data);
      var fields = Ext.Object.getKeys(data[0]),
          store = Ext.create('Rally.data.custom.Store',{
             fields: fields,
             data: data,
             pageSize: data.length
          });

        return Ext.widget({
          xtype:'rallygrid',
          store: store,
          title: project,
          margin: '15 0 25 0',
          columnCfgs: this._getColumnCfgs(data),
          showPagingToolbar: false,
          showRowActionsColumn: false
        });
    },

    _getColumnCfgs: function(data){
        var cols = [{
           dataIndex: 'name',
           text: 'Metric',
           flex: 2
        }];
        var excludedKeys = ['name','key','project','total','isPercent'];
        this.logger.log('_getColumnCfgs', data);
        _.each(Ext.Object.getKeys(data[0]),function(key){
           if (!Ext.Array.contains(excludedKeys,key)){
             cols.push({
               dataIndex: key,
               text: key,
               renderer: this._numberRenderer,
               flex: 1
             });
           }
        }, this);
        cols.push({
          dataIndex: 'total',
          text: 'Total',
          renderer: this._numberTotalRenderer,
          flex: 1
        });

        return cols;
    },
    _numberTotalRenderer: function(v,m,r){
        if (r.get('isPercent') === true ){
            v = Math.round(v*100) + '%';
        }

       if (!isNaN(v) && v % 1 !== 0){
          v = v.toFixed(2);
       }
         return '<div class="app-summary">' + v + "</div>";
    },
    _numberRenderer: function(v,m,r,rowIndex,colIndex){
        if (r.get('isPercent') === true ){
            return Math.round(v*100) + '%';
        }

       if (!isNaN(v) && v % 1 !== 0){
          return v.toFixed(2);
       }
       return v;
    },
    _getSummaryColumnCfgs: function(data){
        var cols = [{
           dataIndex: 'project',
           text: 'Team',
           flex: 3,
           summaryType: 'count',
           summaryRenderer: function(value, summaryData, dataIndex) {
              return Ext.String.format('<div class="app-summary">{0} Team{1} Total</div>', value, value !== 1 ? 's' : '');
          }
        },{
           dataIndex: 'plannedPoints',
           text: 'Points Planned',
           flex: 1,
           summaryType: 'sum',
           summaryRenderer: function(value, summaryData, dataIndex) {
              return Ext.String.format('<div class="app-summary">{0}</div>', value);
          }
        },{
           dataIndex: 'pointsAccepted',
           text: 'Points Accepted',
           flex: 1,
           summaryType: 'sum',
           summaryRenderer: function(value, summaryData, dataIndex) {
              return Ext.String.format('<div class="app-summary">{0}</div>', value);
          }
        },{
           dataIndex: 'plannedAcceptedPoints',
           text: 'Planned Accepted Points',
           flex: 1,
           //hidden: true,
           summaryType: 'sum'
        },{
           dataIndex: 'pointsAdded',
           text: 'Points Added after Commitment',
           flex: 1,
           summaryType: 'sum',
           summaryRenderer: function(value, summaryData, dataIndex) {
              return Ext.String.format('<div class="app-summary">{0}</div>', value);
          }
        },{
           dataIndex: 'plannedAcceptanceRatio',
           text: 'Planned Point Acceptance Rate',
           flex: 1,
           renderer: function(v, m, r){
              return Math.round(v*100) + '%';
           },
           summaryType: 'average',
           flex: 1,
           summaryRenderer: function(value, el, summaryData, dataIndex) {
             if (summaryData.data.plannedPoints > 0 && summaryData.data.plannedAcceptedPoints > 0){
                return '<div class="app-summary">' + Math.round(summaryData.data.plannedAcceptedPoints/summaryData.data.plannedPoints * 100) + '%</div>';
             }
             return '--';
           }
        },{
           dataIndex: 'acceptanceRatio',
           text: 'Point Acceptance Rate',
           flex: 1,
           renderer: function(v, m, r){
              return Math.round(v*100) + '%';
           },
           summaryType: 'average',
           flex: 1,
           summaryRenderer: function(value, el, summaryData, dataIndex) {
             if (summaryData.data.plannedPoints > 0 && summaryData.data.pointsAccepted > 0){
                return '<div class="app-summary">' + Math.round(summaryData.data.pointsAccepted/summaryData.data.plannedPoints * 100) + '%</div>';
             }
             return '--';
           }
        },{
           dataIndex: 'daysBlocked',
           text: 'Days Blocked',
           flex: 1,
           summaryType: 'sum',
           renderer: function(v){
              if (v){
                 return Math.round(v*100)/100;
              }
              return v;
           },
           summaryRenderer: function(value, summaryData, dataIndex) {
              return Ext.String.format('<div class="app-summary">{0}</div>', value);
          }
        },{
           dataIndex: 'blockerResolution',
           text: 'Average Days to Resolve Blockers',
           flex: 1,
           summaryType: 'average',
           renderer: this._numberRenderer,
           summaryRenderer: function(value, summaryData, dataIndex) {
               if (value > 0){
                  value = value.toFixed(2);
               }
              return Ext.String.format('<div class="app-summary">{0}</div>', value);
          }
        },{
          dataIndex: 'defectsClosed',
          text: 'Total number of Defects Closed',
          flex: 1,
          summaryType: 'sum',
          summaryRenderer: function(value, summaryData, dataIndex) {
             return Ext.String.format('<div class="app-summary">{0}</div>', value);
         }
       }];

        if (this.getShowPIPMetrics()){
           cols = cols.concat([{
             dataIndex: 'piPlanVelocity',
             text: 'Total PI Plan Velocity',
             flex: 1,
             summaryType: 'sum',
             summaryRenderer: function(value, summaryData, dataIndex) {
                return Ext.String.format('<div class="app-summary">{0}</div>', value);
            }
           },{
             dataIndex: 'piPlanLoad',
             text: 'Total PI Plan Load',
             flex: 1,
             summaryType: 'sum',
             summaryRenderer: function(value, summaryData, dataIndex) {
                return Ext.String.format('<div class="app-summary">{0}</div>', value);
            }
           }]);
         }
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
    getdaysOffsetFromIterationStart: function(){
        return this.getSetting('daysOffsetFromIterationStart');
    },
    getShowPIPMetrics: function(){
       return this.getSetting('showPIPMetrics');
    },
    getDefectTag: function(){
      return this.getSetting('defectTag');
    },
    getDaysOffsetFromPIStart: function(){
       return this.getSetting('daysOffsetFromPIStart');
    },
    getSettingsFields: function() {
        var defectTags = this.getSetting('defectTag');
        this.logger.log('defectTags', defectTags);
        return [{
           name: 'daysOffsetFromIterationStart',
           xtype: 'rallynumberfield',
           minValue: 0,
           maxValue: 30,
           fieldLabel: 'Days Offset From Iteration Start',
           labelAlign: 'right',
           margin: 10,
           labelWidth: 200
        },{
          name: 'daysOffsetFromPIStart',
          xtype: 'rallynumberfield',
          minValue: 0,
          maxValue: 30,
          fieldLabel: 'Days Offset From PI Start',
          labelAlign: 'right',
          margin: 10,
          labelWidth: 200
        },{
           name: 'showPIPMetrics',
           fieldLabel: 'Show PIP metrics',
           xtype:'rallycheckboxfield',
           labelAlign: 'right',
           checked: this.getSetting('showPIPMetrics'),
           margin: 10,
           labelWidth: 200
        },{
           name: 'defectTag',
           xtype: 'enhancedtagselector',
           fieldLabel: '',
           value: this.getSetting('defectTag'),
           width: '100%'
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
