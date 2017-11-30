var useObjectID = function(value,record) {
    if ( record.get('ObjectID') ) {
        return record.get('ObjectID');
    }
    return 0;
};

var shiftDayBeginningToEnd = function(day) {
    return Rally.util.DateTime.add(Rally.util.DateTime.add(Rally.util.DateTime.add(day,'hour',23), 'minute',59),'second',59);
};

Ext.define('mockStory',{
    extend: 'Ext.data.Model',
    fields: [
        {name:'ObjectID', type: 'int'},
        {name:'Name',type:'string'},
        {name:'PlanEstimate',type:'int'},
        {name:'id',type:'int',convert:useObjectID},
        {name:'ScheduleState',type:'string',defaultValue:'Defined'}
    ]
});

Ext.define('mockSnapshot',{
  extend: 'Ext.data.Model',
  fields: [
      {name:'ObjectID', type: 'int'},
      {name:'Name',type:'string'},
      {name:'PlanEstimate',type:'int'},
      {name:'id',type:'int',convert:useObjectID},
      {name:'ScheduleState',type:'string',defaultValue:'Defined'},
      {name:'_ValidFrom',type:'auto'},
      {name:'_ValidTo',type:'auto'},
      {name:'Iteration',type:'int'},
      {name:'AcceptedDate',type:'auto'},
      {name:'Project',type:'auto'},
      {name:'Blocked'},
      {name:'Tags',type:'auto'},
      {name:'_TypeHierarchy',type:'auto'}
  ]
});

Ext.define('mockIteration',{
    extend: 'Ext.data.Model',
    fields: [
        {name:'ObjectID', type: 'int'},
        {name:'Name',type:'string'},
        {name:'StartDate',type:'auto'},
        {name:'EndDate',type:'auto'},
        {name:'id',type:'int',convert:useObjectID},
        {name:'Project',type:'auto'},
        {name:'RevisionHistory',type:'auto'},
        {name:'PlannedVelocity',type:'auto'},
        {name:'CreationDate',type:'auto'}
    ]
});

Ext.define('mockIterationRevision',{
    extend: 'Ext.data.Model',
    fields: [
        {name:'ObjectID', type: 'int'},
        {name:'RevisionHistory',type:'auto'},
        {name:'Description',type:'string'},
        {name:'CreationDate',type:'auto'},
        {name:'id',type:'int',convert:useObjectID}
    ]
});

Ext.define('mockCFD',{
    extend: 'Ext.data.Model',
    fields: [
        {name:'CardCount',type:'int'},
        {name:'CardEstimateTotal',type:'int'},
        {name:'CardState',type:'string'},
        {name:'CardToDoTotal',type:'int'},
        {name:'CreationDate',type:'date'},
        {name:'ObjectID',type:'int'},
        {name:'TaskEstimateTotal',type:'int'}
    ]
});
