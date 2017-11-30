Ext.define('CArABU.utils.panel.SummaryPanel',{
  extend: 'Ext.panel.Panel',
  alias: 'widget.summarypanel',
  title: 'Summary',
  collapsible: true,
  cls: 'app-panel',
  
  layout: 'fit',
  initComponent: function(){
     this.callParent();
     console.log('config', this);
  }
  // constructor: function(config){
  //
  //         // _.each(data.releases, function(r){
  //         //     var project = r.get('Project');
  //         //     var calc = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
  //         //        project: project,
  //         //        iterations: data.iterations,
  //         //        snapshots: data.snapshots
  //         //     });
  //         // });
  // }

});
