/**
 * 
 * @author admin
 * @stateless
 * @public 
 */
define('Server', ['orm', 'rpc', 'Settings'], function (Orm, Rpc, Settings, ModuleName) {
    function module_constructor() {
        var self = this, model = Orm.loadModel(ModuleName)
                , FileUtils = new Rpc.Proxy('FileUtils');
        
        var SmallImageDirectory = Settings.SmallImageDirectory;
        
        self.deleteItems = function (aData, callback, error) {
            model.qSelect.requery(function () {
                var sd = model.qSelect.length - 1;
                for (var i = sd; i >= 0; i--) {
                    for (var s = aData.length - 1; s >= 0; s--) {
                        if (model.qSelect[i].item_id === aData[s]) {
                            FileUtils.deleteFile(model.qSelect[i].URL);
                            model.qSelect.splice(i, 1);
                            break;
                        }
                    }
                    ;
                }
                ;
                model.save(function () {
                    callback('Succes!');
                }, function (err) {
                    error(err);
                });
            });
        };

        self.insertItemFromPc = function (aData, aByteArr, callback, error) {
            model.qSelect.requery(function () {
                model.qSelect.push({
                    name: aData.name,
                    description: aData.description,
                    type: aData.type,
                    URL: aData.URL
                });
                FileUtils.createFile(aByteArr, aData.URL, function () {
                    model.save(function () {
                        FileUtils.changeSize(aData.URL, SmallImageDirectory + aData.name, function (Text) {
                            callback(Text);
                        });
                    }, function (err) {
                        error(err);
                        FileUtils.deleteFile(aData.URL, function (Text) {
                            callback(Text);
                        });
                    });
                }, function (err) {
                    error(err);
                });
            });
        };

        self.insertItemFromServer = function (aData, anUrl, callback, error) {
            model.qSelect.requery(function () {
                model.qSelect.push({
                    name: aData.name,
                    description: aData.description,
                    type: aData.type,
                    URL: aData.URL
                });
                FileUtils.loadFile(anUrl, aData.URL, function () {
                    model.save(function () {
                        FileUtils.changeSize(aData.URL, SmallImageDirectory + aData.name, function (Text) {
                            callback(Text);
                        });
                    }, function (err) {
                        error(err);
                        FileUtils.deleteFile(aData.URL, function (Text) {
                            callback(Text);
                        });
                    });
                }, function (err) {
                    error(err);
                });
            });
        };

        self.changeInfo = function (anItemId, aDescription, callback, error) {
            model.qChoose.params.item_id = +anItemId;
            model.qChoose.requery(function () {
                if (model.qChoose.length) {
                    model.qChoose[0].description = aDescription;
                    model.save(function () {
                        callback('Succes!');
                    }, function (err) {
                        error(err);
                    });
                } else {
                    error('File not found1');
                }
            });
        };
        
        self.getInfo = function(callback, error) {
            model.qSelect.query({}, callback, error);
        };
        
        self.getSmallImageDirectory = function(callback, error) {
            callback(SmallImageDirectory, error);
        };
    }
    return module_constructor;
});
