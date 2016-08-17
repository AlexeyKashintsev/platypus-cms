/**
 * 
 * @author admin
 * @stateless
 * @public 
 */
define('Page_server', ['orm', 'page_display_API', 'page_creator_API', 'page_editor_API', 'widget_API'], function (Orm, Page_display_API, Page_creator_API, Page_editor_API, Widget_API, ModuleName) {
    function module_constructor() {
        var self = this
        , page_display_API = new Page_display_API()
        , page_creator_API = new Page_creator_API()
        , page_editor_API = new Page_editor_API()
        , widget_API = new Widget_API();

        /*
         * @get /createPage
         */
        self.createPage = function (aPageId, callback, error) {
            page_display_API.getMetaInformation(aPageId, function (Meta) {
                var c_Template = new Array();
                page_display_API.getTemplateInformation(aPageId, function (Template) {
                    var count_template = 0;
                    var changes = [];
                    var page_widgets = [];
                    Template.forEach(function (data) {
                        var laypout = '';
                        page_display_API.getPageWidgets(data.template_id, function (widgets) {
                            widgets.forEach(function (obj) {
                                var status = 0;
                                page_widgets.forEach(function (page_widget) {
                                    if (page_widget.name === obj.name) {
                                        status = 1;
                                    }
                                });
                                if (status === 0) {
                                    page_widgets.push(obj);
                                }
                                laypout = laypout + obj.name;
                                changes.push(obj.name);
                            });
                            c_Template.push({
                                template_name: data.template_name,
                                layout: laypout
                            });
                            count_template++;
                            if (Template.length === count_template) {
                                page_creator_API.createPage('1', Meta[0].meta_inf, Template[0], c_Template, changes, page_widgets, function (Text) {
                                    callback(Text);
                                }, function (err) {
                                    error(err);
                                });
                            }
                        });
                    });
                });
            });
        };
        
        /*
         * @get/getPageList
         */
        self.getPageList = function (callback, error) {
            page_display_API.getPagesList(callback, error);
        };
        
        /*
         * @get/getWidgetsList
         */
        self.getWidgetsList = function (callback, error) {
            widget_API.getWidgetsList(callback, error);
        };
        
        /*
         * @get/getPageInfo
         */
        self.getPageInfo = function (aPageId, callback, error) {
            page_display_API.getPageInfo(aPageId, callback, error);
        };
        
        /*
         * @get/getMeta
         */
        self.getMeta = function (aPageId, callback, error) {
            page_display_API.getMetaInformation(aPageId, callback, error);
        };
        
        /*
         * @get /getWidgetInfo
         */
        self.getWidgetInfo = function(aWidgetId, callback, error) {
            widget_API.getWidgetInfo(aWidgetId, callback, error);
        };
        
        /*
         * @get /getWidgetData
         */
        self.getWidgetData = function(aWidgetId, callback, error) {
            widget_API.getWidgetData(aWidgetId, callback, error);
        };
        
        /*
         * @get/changePageInfo
         */
        self.changePageInfo = function (aPageInfo, callback, error) {
            page_editor_API.changePageInfo(aPageInfo, callback, error);
        };
        
        /*
         * @get/changeWidgetInfo
         */
        self.changeWidgetInfo = function (aWidget, callback, error) {
            widget_API.changeWidgetInfo(aWidget, callback, error);
        };
        
        /*
         * @get/changePageMetaInfo
         */
        self.changePageMetaInfo = function (aPageId, aMetaInfo, callback, error) {
            page_editor_API.changePageMetaInfo(aPageId, aMetaInfo, callback, error);
        };
        
        /*
         * @get/changeWidgetData
         */
        self.changeWidgetData = function (aWidgetId, aWidgetData, callback, error) {
            widget_API.changeWidgetData(aWidgetId, aWidgetData, callback, error);
        };
        
        /*
         * @get/deletePage
         */
        self.deletePage = function (aPageId, callback, error) {
            page_editor_API.deletePage(aPageId, callback, error);
        };
        
        /*
         * @get /deleteWidget
         */
        self.deleteWidget = function (aWidgetId, callback, error) {
            widget_API.deleteWidget(aWidgetId, callback, error);
        };
        
        /*
         * @get/addPageToDb
         */
        self.addPageToDb = function (aPageInfo, callback, error) {
            page_editor_API.createPage(aPageInfo, callback, error);
        };
        
        /*
         * @get /addWidgetToDb
         */
        self.addWidgetToDb = function (aPageInfo, callback, error) {
            widget_API.createWidget(aPageInfo, callback, error);
        };
    }
    return module_constructor;
});
