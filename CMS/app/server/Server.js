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
         * @get /deleteItems
         */
        self.deleteItems = function (aData, callback, error) {
            model.qSelect.requery(function () {
                var sd = model.qSelect.length - 1;
                for (var i = sd; i >= 0; i--) {
                    for (var s = aData.length - 1; s >= 0; s--) {
                        if (model.qSelect[i].item_id === aData[s]) {
                            ImageUtils.deleteImage(model.qSelect[i].name, function () {
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
         * @get /insertItem
         */
        self.insertItem = function (aData, callback, error) {
            var currentCount = 0;
            aData.forEach(function (d) {
                model.qSelect.push({
                    item_id: d.item_id,
                    name: d.name,
                    description: d.description,
                    type: d.type,
                    url: d.url
                });
                ImageUtils.processLoadedImageFile(d.imgURL, d.name, function () {
                    ImageUtils.changeSize(d.name, SmallImageDirectory + d.name, function (Text) {
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
                    error('File not found1');
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
    }
    return module_constructor;
});
