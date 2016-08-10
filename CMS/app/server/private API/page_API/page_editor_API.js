/**
 * 
 * @author admin
 * @stateless
 * @public 
 */
define('page_editor_API', ['orm', 'id'], function (Orm, Id, ModuleName) {
    function module_constructor() {
        var self = this, model = Orm.loadModel(ModuleName);

        /*
         * @get /deletePage
         */
        self.deletePage = function (aPageID, callback, error) {
            model.qGetPageInfoViaId.params.aPageId = +aPageID;
            model.qGetPageInfoViaId.requery(function () {
                if (model.qGetPageInfoViaId.length) {
                    model.qGetPageInfoViaId.splice(model.qGetPageInfoViaId.indexOf(model.qGetPageInfoViaId), 1);
                    model.save(function () {
                        callback('Succes!');
                    }, function (err) {
                        error(err);
                    });
                }
            });
        };

        /*
         * @get /createPage
         */
        self.createPage = function (aPageInfo, callback, error) {
            model.qGetPageInfoViaId.params.aPageId = 'h';
            model.qGetPageInfoViaId.requery(function () {
                model.qGetPageInfoViaId.push({
                    page_id: aPageInfo.page_id,
                    name: aPageInfo.name,
                    author: aPageInfo.author,
                    url: aPageInfo.url,
                    template_id: aPageInfo.template_id,
                    language_id: aPageInfo.language_id
                });
                model.save(function () {
                    callback('Succes!');
                }, function (err) {
                    error(err);
                });
            });
        };

        /*
         * @get /createTemplate
         */
        self.createTemplate = function (aName, callback, error) {
            model.qGetRootTemplateTemplate.params.aName = aName;
            model.qGetRootTemplateTemplate.requery(function () {
                model.qGetPagesTemplateInfo.params.aPageId = 1;
                model.qGetPagesTemplateInfo.requery(function () {
                    var root_id = Id.generate();
                    model.qGetPagesTemplateInfo.push({
                        template_id: root_id,
                        root_layout: model.qGetRootTemplateTemplate[0].layout,
                        template_name: model.qGetRootTemplateTemplate[0].name,
                        styles: model.qGetRootTemplateTemplate[0].styles
                    });
                    model.qGetRootTemplateTemplate.forEach(function (temp) {
                        model.qGetPagesTemplateInfo.push({
                            root_template: root_id,
                            template_name: temp.template_name
                        });
                    });
                    model.save(function () {
                        callback(root_id);
                    }, function (err) {
                        error(err);
                    });
                });
            });
        };

        /*
         * @get /changeInfo
         */
        self.changePageInfo = function (aPageInfo, callback, error) {
            model.qGetPageInfoViaId.params.aPageId = +aPageInfo.page_id;
            model.qGetPageInfoViaId.requery(function () {
                if (model.qGetPageInfoViaId.length) {
                    model.qGetPageInfoViaId[0].page_name = aPageInfo.page_name;
                    model.qGetPageInfoViaId[0].url = aPageInfo.url;
                    model.qGetPageInfoViaId[0].author = aPageInfo.author;
                    model.qGetPageInfoViaId[0].template_id = aPageInfo.template_id;
                    model.qGetPageInfoViaId[0].language_id = aPageInfo.language_id;
                    model.save(function () {
                        callback('Succes!');
                    }, function (err) {
                        error(err);
                    });
                }
            });
        };

        /*
         * @get /changePageMetaInfo
         */
        self.changePageMetaInfo = function (aPageId, aMetaInfo, callback, error) {
            model.qGetPagesMetaInfo.params.aPageId = +aPageId;
            model.qGetPagesMetaInfo.requery(function () {
                if (model.qGetPagesMetaInfo.length) {
                    model.qGetPagesMetaInfo[0].meta_inf = aMetaInfo;
                    model.save(function () {
                        callback('Succes!');
                    }, function (err) {
                        error(err);
                    });
                } else {
                    model.qGetPagesMetaInfo.push({
                        meta_inf: aMetaInfo,
                        page_id: aPageId
                    });
                    model.save(function () {
                        callback('Succes!');
                    }, function (err) {
                        error(err);
                    });
                }
            });
        };

        /*
         * @get /changePageWidgets
         */
        self.changePageWidgets = function (aTemplateId, aWidgets, callback, error) {
            model.qGetTemplateWidgetList.params.aTemplateId = +aTemplateId;
            model.qGetTemplateWidgetList.requery(function () {
                model.qGetTemplateWidgetList.forEach(function (Widget) {
                    var status = 0;
                    aWidgets.forEach(function (newWidget) {
                        if (newWidget === Widget.widget_id) {
                            status = 1;
                        }
                    });
                    if (status === 0) {
                        model.qGetTemplateWidgetList.splice(model.qGetTemplateWidgetList.indexOf(Widget), 1);
                        model.save(function () {
                            callback('Succes!');
                        }, function (err) {
                            error(err);
                        });
                    }
                });
                aWidgets.forEach(function (newWidget) {
                    var status = 0;
                    model.qGetTemplateWidgetList.forEach(function (Widget) {
                        if (newWidget === Widget.widget_id) {
                            status = 1;
                        }
                    });
                    if (status === 0) {
                        model.qGetTemplateWidgetList.push({
                            widget_id: newWidget,
                            template_id: aTemplateId
                        });
                    }
                });
                model.save(function () {
                    callback('Succes!');
                }, function (err) {
                    error(err);
                });
            });
        };
    }
    return module_constructor;
});
