Ext.define("CArABU.app.safeDeliveryMetrics", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new CArABU.technicalservices.Logger(),
    defaults: { margin: 10 },
    layout: 'border',

    items: [
        {xtype:'container',flex: 1, itemId:'grid_box1', region: 'west'},
        {xtype:'container',flex: 1, itemId:'grid_box2', region: 'east'}
    ],

    integrationHeaders : {
        name : "CArABU.app.TSApp"
    },

    launch: function() {
        var me = this;
        this.setLoading("Loading stuff...");

        this.logger.setSaveForLater(this.getSetting('saveLog'));

        Deft.Chain.sequence([
            function() {
                return TSUtilities.loadAStoreWithAPromise('Defect',['Name','State']);
            },
            function() {
                return TSUtilities.loadWsapiRecords({
                    model:'Defect',
                    fetch: ['Name','State']
                });
            }
        ]).then({
            scope: this,
            success: function(results) {
                var store = results[0];
                var defects = results[1];
                var field_names = ['Name','State'];

                this._displayGridGivenStore(store,field_names);
                this._displayGridGivenRecords(defects,field_names);
            },
            failure: function(error_message){
                alert(error_message);
            }
        }).always(function() {
            me.setLoading(false);
        });
    },

    _displayGridGivenStore: function(store,field_names){
        this.down('#grid_box1').add({
            xtype: 'rallygrid',
            store: store,
            columnCfgs: field_names
        });
    },

    _displayGridGivenRecords: function(records,field_names){
        var store = Ext.create('Rally.data.custom.Store',{
            data: records
        });

        var cols = Ext.Array.map(field_names, function(name){
            return { dataIndex: name, text: name, flex: 1 };
        });
        this.down('#grid_box2').add({
            xtype: 'rallygrid',
            store: store,
            columnCfgs: cols
        });
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
