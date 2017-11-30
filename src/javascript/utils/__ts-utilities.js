Ext.define('TSUtilities', {

    singleton: true,

    loadWsapiRecords: function(config){
        var deferred = Ext.create('Deft.Deferred');
        var default_config = {
            model: 'Defect',
            fetch: ['ObjectID'],
            pageSize: 2000,
            limit: 'Infinity'
        };
        Ext.create('Rally.data.wsapi.Store', Ext.Object.merge(default_config,config)).load({
            callback : function(records, operation, successful) {
                if (successful){
                    deferred.resolve(records);
                } else {
                    deferred.reject('Problem loading: ' + operation.error.errors.join('. '));
                }
            }
        });
        return deferred.promise;
    },
      saveCSVToFile:function(csv,file_name,type_object){
          if (type_object === undefined){
              type_object = {type:'text/csv;charset=utf-8'};
          }
          this.saveAs(csv,file_name, type_object);
      },
      saveAs: function(textToWrite, fileName)
      {
          if (Ext.isIE9m){
              Rally.ui.notify.Notifier.showWarning({message: "Export is not supported for IE9 and below."});
              return;
          }

          var textFileAsBlob = null;
          try {
              textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
          }
          catch(e){
              window.BlobBuilder = window.BlobBuilder ||
                  window.WebKitBlobBuilder ||
                  window.MozBlobBuilder ||
                  window.MSBlobBuilder;
              if (window.BlobBuilder && e.name == 'TypeError'){
                  bb = new BlobBuilder();
                  bb.append([textToWrite]);
                  textFileAsBlob = bb.getBlob("text/plain");
              }
          }

          if (!textFileAsBlob){
              Rally.ui.notify.Notifier.showWarning({message: "Export is not supported for this browser."});
              return;
          }

          var fileNameToSaveAs = fileName;

          if (Ext.isIE10p){
              window.navigator.msSaveOrOpenBlob(textFileAsBlob,fileNameToSaveAs); // Now the user will have the option of clicking the Save button and the Open button.
              return;
          }

          var url = this.createObjectURL(textFileAsBlob);

          if (url){
              var downloadLink = document.createElement("a");
              if ("download" in downloadLink){
                  downloadLink.download = fileNameToSaveAs;
              } else {
                  //Open the file in a new tab
                  downloadLink.target = "_blank";
              }

              downloadLink.innerHTML = "Download File";
              downloadLink.href = url;
              if (!Ext.isChrome){
                  // Firefox requires the link to be added to the DOM
                  // before it can be clicked.
                  downloadLink.onclick = this.destroyClickedElement;
                  downloadLink.style.display = "none";
                  document.body.appendChild(downloadLink);
              }
              downloadLink.click();
          } else {
              Rally.ui.notify.Notifier.showError({message: "Export is not supported "});
          }

      },
      createObjectURL: function ( file ) {
          if ( window.webkitURL ) {
              return window.webkitURL.createObjectURL( file );
          } else if ( window.URL && window.URL.createObjectURL ) {
              return window.URL.createObjectURL( file );
          } else {
              return null;
          }
      },
      destroyClickedElement: function(event)
      {
          document.body.removeChild(event.target);
      }
});
