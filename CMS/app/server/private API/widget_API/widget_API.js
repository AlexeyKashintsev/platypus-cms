/**
 *
 * @author admin
 * @stateless
 * @public
 */
define('widget_API', ['orm', 'logger'], function (Orm, Logger, ModuleName) {
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
            model.qGetWidgetViaID.params.aWidgetId = +aWidget.widget_id;
            model.qGetWidgetViaID.requery(function () {
                if (model.qGetWidgetViaID.length) {
                    model.qGetWidgetViaID[0].name = aWidget.name;
                    model.qGetWidgetViaID[0].author = aWidget.author;
                    model.qGetWidgetViaID[0].description = aWidget.description;
                    model.qGetWidgetViaID[0].layout = aWidget.layout;
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
            model.qGetWidgetData.params.aWidgetId = +aWidgetId;
            model.qGetWidgetData.requery(function () {
                for (var i = model.qGetWidgetData.length - 1; i > -1; i--) {
                    var status = 0;
                    for (var s = aWidgetData.length - 1; s > -1; s--) {
                        if (aWidgetData[s].widget_data_id === model.qGetWidgetData[i].widget_data_id) {
                            status = 1;
                        }
                    }
                    if (status === 0) {
                        model.qGetWidgetData.splice(model.qGetWidgetData.indexOf(model.qGetWidgetData[i]), 1);
                    }
                }
                for (var i = aWidgetData.length - 1; i > -1; i--) {
                    var status = 0;
                    for (var s = model.qGetWidgetData.length - 1; s > -1; s--) {
                        if (aWidgetData[i].widget_data_id === model.qGetWidgetData[s].widget_data_id) {
                            status = 1;
                        }
                    }
                    if (status === 0) {
                        model.qGetWidgetData.push({
                            data_name: aWidgetData[i].data_name,
                            data_value: aWidgetData[i].data_value,
                            widget_id: aWidgetId
                        });
                    }
                }
                model.save(function () {
                    callback('Succes');
                }, function (err) {
                    error(err);
                });
            }, error);
        };

        /*
         * @get /createWidget
         */
        self.createWidget = function (aWidgetInfo, callback, error) {
            model.qGetWidgetInfo.params.aWidgetId = 0000;
            model.qGetWidgetInfo.requery(function () {
                model.qGetWidgetInfo.push({
                    widget_id: aWidgetInfo.widget_id,
                    name: aWidgetInfo.name,
                    author: aWidgetInfo.author
//                    description: aWidgetInfo.description,
//                    layout: aWidgetInfo.layout
                });
                model.save(function () {
                    callback('Succes!');
                }, function (err) {
                    error(err);
                });
//                model.qGetWidgetData.query({aWidgetId: +aWidgetInfo.widget_id}, function () {
//                    aWidgetData.forEach(function (Data) {
//                        model.qGetWidgetData.push({
//                            data_name: Data.data_name,
//                            data: Data.data,
//                            widget_id: Data.widget_id
//                        });
//                    });
//                    model.save(function () {
//                        callback('Succes!');
//                    }, function (err) {
//                        error(err);
//                    });
//                });
            });
        };

        /*
         * @get /deleteWidget
         */
        self.deleteWidget = function (aWidgetId, callback, error) {
            model.qGetWidgetViaID.params.aWidgetId = +aWidgetId;
            model.qGetWidgetViaID.requery(function () {
                if (model.qGetWidgetViaID.length) {
                    model.qGetWidgetViaID.splice(model.qGetWidgetViaID.indexOf(model.qGetWidgetViaID), 1);
                    model.save(function () {
                        callback('Succes!');
                    }, function (err) {
                        error(err);
                    });
                } else {
                    error('Not found!');
                }
            });
        };
    }
    return module_constructor;
});
