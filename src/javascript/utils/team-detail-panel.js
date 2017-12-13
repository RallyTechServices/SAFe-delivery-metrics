// Ext.define('CArABU.utils.panel.TeamDetailPanel',{
// //  extend: 'Ext.panel.Panel',
//   extend: 'Ext.container.Container',
//   alias: 'widget.teamdetailpanel',
//
//   cls: 'inline-filter-panel',
//       flex: 1,
//       header: false,
//       minHeight: 46,
//       padding: '8px 0 0 0',
//       bodyPadding: '7px 5px 5px 5px',
//       collapseDirection: 'top',
//       collapsible: true,
//       animCollapse: false,
//       stateful: true,
//       stateId: 'listFilterPanel',
//   cls: 'fieldBucket',
//   autoScroll: true,
//
//   initComponent: function(){
//       this.items = this._buildPanel();
//       this.on('boxready',this.onBoxReady, this);
//       this.callParent();
//
//   },
//   onBoxReady: function(g, width, height){
//      console.log('this', width, height);
//   },
//   _buildPanel: function(){
//     console.log('_buildPanel', this.rendered);
//     var items = [],
//       data = [];
//     _.each(this.releases, function(r){
//         var project = r.get('Project');
//         var calc = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
//            project: project,
//            iterations: this.iterations,
//            snapshots: this.snapshots
//         });
//
//         //data = data.concat(calc.getData());
//         items.push(this._addTeamGrid(calc.getData(), project.Name));
//         console.log('project',project);
//     }, this);
//
//     return [{
//        width: '100%',
//        layout: {
//           type: 'vbox'
//        },
//        items: items
//     }];
//
//     //return [this._addGroupedTeamGrid(data)];
//   },
//   _addTeamGrid: function(data, project){
//
//     var fields = Ext.Object.getKeys(data[0]),
//         store = Ext.create('Rally.data.custom.Store',{
//            //fields: fields,
//            data: data,
//            pageSize: data.length
//         });
//
//       return Ext.widget({
//         xtype:'rallygrid',
//         store: store,
//         title: project,
//         //height: 300,
//         flex: 1,
//         columnCfgs: this._getColumnCfgs(data),
//         showPagingToolbar: false,
//         showRowActionsColumn: false
//       });
//   },
//   _addGroupedTeamGrid: function(data){
//     var fields = Ext.Object.getKeys(data[0]),
//         store = Ext.create('Rally.data.custom.Store',{
//            //fields: fields,
//            data: data,
//            pageSize: data.length,
//            groupField: 'name'
//         });
//
//         console.log('data',data);
//       return {
//         xtype:'rallygrid',
//         store: store,
//         //title: project,
//         features: {ftype: 'grouping'},
//         //height: 300,
//         columnCfgs: this._getColumnCfgs(data),
//         showPagingToolbar: false,
//         showRowActionsColumn: false
//       };
//   },
//   _getColumnCfgs: function(data){
//       var cols = [{
//          dataIndex: 'name',
//          text: 'Metric'
//       }];
//
//       _.each(Ext.Object.getKeys(data[0]),function(key){
//          if (key !== 'name' && key !== 'total' && key !== 'project'){
//            cols.push({
//              dataIndex: key,
//              text: key
//            });
//          }
//       });
//
//       cols.push({
//         dataIndex: 'total',
//         text: 'Total'
//       });
//
//       return cols;
//   }
//
// });
