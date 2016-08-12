/**
 * 
 * @author admin
 * @stateless
 * @public 
 */
define('widget_API', ['orm'], function (Orm, ModuleName) {
    function module_constructor() {
        var self = this, model = Orm.loadModel(ModuleName);

        /*
         * @get /getWidgetsList
         */
        self.getWidgetsList = function (callback, error) {
            model.qGetWidgets.query({}, callback, error);
        };
        
        /*
         * @get /getWidgetInfo
         */
        self.getWidgetInfo = function (aWidgetId, callback, error) {
            model.qGetWidgetViaID.query({aWidgetId: +aWidgetId}, callback, error);
        };
        
        /*
         * @get /getWidgetData
         */
        self.getWidgetData = function (aWidgetId, callback, error) {
            model.qGetWidgetData.query({aWidgetId: +aWidgetId}, callback, error);
        };

        /*
         * @get /changeWidgetInfo
         */
        self.changeWidgetInfo = function (aWidget, callback, error) {
            model.qGetWidgetViaId.query({aWidgetId: +aWidgetId}, function () {
                if (model.qGetWidgetViaId.length) {
                    model.qGetWidgetViaId[0].name = aWidget.name;
                    model.qGetWidgetViaId[0].author = aWidget.author;
                    model.qGetWidgetViaId[0].description = aWidget.description;
                    model.qGetWidgetViaId[0].layout = aWidget.layout;
                    model.save(function () {
                        callback('Succes!');
                    }, error);
                } else {
                    error('Widget not found!');
                }
            }, error);
        };

        /*
         * @get /changeWidgetData
         */
        self.changeWidgetData = function (aWidgetId, aWidgetData, callback, error) {
            model.qGetWidgetData.query({aWidgetId: +aWidgetId}, function () {
                model.qGetWidgetData.forEach(function (WidgetData) {
                    var status = 0;
                    aWidgetData.forEach(function (newWidgetData) {
                        if (newWidgetData.widget_id === WidgetData.widget_id) {
                            status = 1;
                        }
                    });
                    if (status === 0) {
                        model.qGetWidgetData.splice(model.qGetWidgetData.indexOf(WidgetData), 1);
                        model.save(function () {
                            callback('Succes!');
                        }, function (err) {
                            error(err);
                        });
                    }
                });
                aWidgetData.forEach(function (newWidgetData) {
                    var status = 0;
                    model.qGetWidgetData.forEach(function (WidgetData) {
                        if (newWidgetData.widget_id === WidgetData.widget_id) {
                            status = 1;
                        }
                    });
                    if (status === 0) {
                        model.qGetWidgetData.push({
                            data_name: newWidgetData.data_name,
                            data: newWidgetData.data,
                            widget_id: aWidgetId
                        });
                        model.save(function () {
                            callback('Succes!');
                        }, function (err) {
                            error(err);
                        });
                    }
                });
            }, error);
        };

        /*
         * @get /createWidget
         */
        self.createWidget = function (aWidgetInfo, aWidgetData, callback, error) {
            model.qGetWidgetsViaID.params.aPageId = 'h';
            model.qGetWidgetsViaID.requery(function () {
                model.qGetWidgetsViaID.push({
                    widget_id: aWidgetInfo.widget_id,
                    name: aWidgetInfo.name,
                    author: aWidgetInfo.author,
                    description: aWidgetInfo.description,
                    layout: aWidgetInfo.layout
                });
                model.qGetWidgetData.query({aWidgetId: +aWidgetInfo.widget_id}, function () {
                    aWidgetData.forEach(function (Data) {
                        model.qGetWidgetData.push({
                            data_name: Data.data_name,
                            data: Data.data,
                            widget_id: Data.widget_id
                        });
                    });
                    model.save(function () {
                        callback('Succes!');
                    }, function (err) {
                        error(err);
                    });
                });
            });
        };
    }
    return module_constructor;
});
