/**
 * 
 * @author admin
 * @stateless
 * @public 
 */
define('MyServer', ['orm', 'Settings', 'logger', 'FileUtils', 'ImageUtils'], function (Orm, Settings, Logger, fileUtils, imageUtils, ModuleName) {
    function module_constructor() {
        var self = this, model = Orm.loadModel(ModuleName)
                , FileUtils = new fileUtils()
                , ImageUtils = new imageUtils();
        var Context = Settings.Context;
        var SmallImageDirectory = Settings.SmallImageDirectory;
        /*
         * @get /deleteImage
         */
        self.deleteImage = function (aData, callback, error) {
            model.qSelect.requery(function () {
                var sd = model.qSelect.length - 1;
                for (var i = sd; i >= 0; i--) {
                    for (var s = aData.length - 1; s >= 0; s--) {
                        if (model.qSelect[i].item_id === aData[s]) {
                            var extension = '.' + model.qSelect[i].url.split('.').pop();
                            ImageUtils.deleteImage(model.qSelect[i].item_id + extension, function () {
                                model.qSelect.splice(i, 1);
                            });
                            break;
                        }
                    }
                }
                model.save(function () {
                    callback('Succes!');
                }, function (err) {
                    error(err);
                });
            });
        };

        /*
         * @get /deleteTempFile
         */
        self.deleteTempFile = function (anUrl, callback, error) {
            FileUtils.deleteTempFile(anUrl, callback, error);
        };

        /*
         * @get /insertItem
         */
        self.insertItem = function (aData, extension, callback, error) {
            var currentCount = 0;
            aData.forEach(function (d) {
                model.qSelect.push({
                    item_id: d.item_id,
                    name: d.name,
                    description: d.description,
                    type: d.type,
                    url: d.url
                });
                ImageUtils.processLoadedImageFile(d.imgURL, d.item_id + extension, function () {
                    ImageUtils.changeSize(d.item_id + extension, SmallImageDirectory + d.item_id + extension, function (Text) {
                        currentCount++;
                        if (currentCount === aData.length) {
                            model.save(function () {
                                callback(Text);
                            }, function (err) {
                                error(err);
                            });
                        }
                    });
                }, function (err) {
                    error(err);
                });
            });
        };

        /*
         * @get /changeInfo
         */
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
                    error('File not found!');
                }
            });
        };

        /*
         * @get /changeName
         */
        self.changeName = function (anItemId, aName, callback, error) {
            model.qChoose.params.item_id = +anItemId;
            model.qChoose.requery(function () {
                if (model.qChoose.length) {
                    model.qChoose[0].name = aName;
                    model.save(function () {
                        callback('Succes!');
                    }, function (err) {
                        error(err);
                    });
                } else {
                    error('File not found!');
                }
            });
        };

        /*
         * @get /getInfo
         */
        self.getInfo = function (callback, error) {
            model.qSelect.query({}, callback, error);
        };

        /*
         * @get /getSmallImageDirectory
         */
        self.getSmallImageDirectory = function (callback, error) {
            callback(SmallImageDirectory);
        };

        /*
         * @get /getContext
         */
        self.getContext = function (callback, error) {
            callback(Context);
        };

        /*
         * @get /getType
         */
        self.getType = function (anExtension, callback, error) {
            model.qGetType.params.extension = anExtension;
            model.qGetType.query({}, callback, error);
        };
    }
    return module_constructor;
});
