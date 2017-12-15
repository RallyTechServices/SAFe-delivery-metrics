
Ext.define('CArABU.utils.settings.EnhancedTagSelector',{
  extend: 'Ext.form.field.Base',
     alias: 'widget.enhancedtagselector',

     fieldSubTpl: '<div id="{id}" class="settings-grid"></div>',

    // width: 400,
    // height: 200,
    // cls: 'column-settings',

     config: {
         value: undefined,
     },

     onRender: function() {
         this.callParent(arguments);

         var values = this.value;
         if (Ext.isString(values)){
            values = values.split(',');
         }
         this._valueRecords = [];

         var filters = _.map(values, function(r){
             return {
                property: 'ObjectID',
                value: Rally.util.Ref.getOidFromRef(r)
             };
         });


         if (filters.length > 0){
           if (filters.length > 1){
               filters = Rally.data.wsapi.Filter.or(filters);
           }

           Ext.create('Rally.data.wsapi.Store',{
              fetch: ['Name'],
              filters: filters,
              model: 'Tag',
              pageSize: filters.length
           }).load({
              callback: function(records, operation){
                 this._valueRecords = _.map(records, function(r){ return r.getData(); });
                 this._buildControls();
              },
              scope: this
           });
         } else {
            this._buildControls();
         }
     },

     _buildControls: function(){
         if (this._ct){
            this._ct.destroy();
         }

         this._ct = Ext.create('Ext.container.Container',{
            layout: 'hbox',
            renderTo: this.inputEl,
            items: [{
               xtype:'rallytagpicker',
               fieldLabel: 'Defect Tags',
               labelWidth: 200,
               labelAlign: 'right',
                enableAddNew: false,
                enableGrouping: false,
                remoteFilter: true,
                storeConfig: {
                    pageSize: 25,
                    limit: 25

                 },
                 margin: '10 10 200 10',
                 width: 400,
                 listeners: {
                     selectionchange: this._refreshPills,
                     scope: this
                 }
            },{
              xtype:'container',
              itemId: 'pillCt',
              flex: 1,
              layout: 'table',
              columns: 3,
              items: this._getSelectedTagPills()
            }]
         });
         this.fireEvent('ready');

     },
     _refreshPills: function(pk, newSelections){
          var existingRecs = _.pluck(this._valueRecords, '_ref');
          pk.collapse();

         _.each(newSelections, function(r){
            if (!Ext.Array.contains(existingRecs, r.get('_ref'))){
               this._valueRecords.push(r.getData());
            }
         }, this);

         this._buildControls();
     },
     _getSelectedTagPills: function(){
          return _.map(this._valueRecords, function(v){
              return {
                 xtype:'rallybutton',
                 text: v.Name,
                 iconCls: 'icon-delete',
                 handler: this._destroyRecord,
                 scope: this,
                 cls: 'tag-btn',
                 tagRef: v._ref,
                 margin: '10 5 5 5'
              };
          }, this);
     },
     _destroyRecord: function(btn){
          this._valueRecords = Ext.Array.remove(this._valueRecords, btn.tagRef);
          btn.destroy();
     },
     /**
      * When a form asks for the data this field represents,
      * give it the name of this field and the ref of the selected project (or an empty string).
      * Used when persisting the value of this field.
      * @return {Object}
      */
     getSubmitData: function() {
         var data = {};
         submitData =  _.pluck(this._valueRecords, '_ref').join(',');
         data[this.name] = submitData;
         return data;
     },

     getErrors: function() {
         var errors = [];
         return errors;
     },

     setValue: function(value) {
         this.callParent(arguments);
         this._value = value;
     }
 });
