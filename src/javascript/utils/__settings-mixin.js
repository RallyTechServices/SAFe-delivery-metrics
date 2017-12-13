Ext.override(Rally.ui.picker.plugin.RemoteFiltering, {

    _onInputTextChanged: function(filterText) {
        var doFilter = !Ext.isEmpty(filterText) && !this.cmp.store.isLoading(), //override
            store = this.cmp.store;

            if (doFilter) {
                    //clear out any filters without the store making a request
                    if (store.filters) {
                        store.filters.clear();
                    }

                    var nameContainsFilter = Ext.create('Rally.data.wsapi.Filter', {
                        property: 'Name',
                        operator: 'contains',
                        value: filterText
                    });

                    store.filter(nameContainsFilter.and({property: 'Archived', value: false})); //this.cmp.getBaseFilter() ? this.cmp.getBaseFilter().and(nameContainsFilter) : nameContainsFilter);
                } else {
                    this.resetMatchedText();
                }

        store.fireEvent('filterbytextinput');
    }
});
