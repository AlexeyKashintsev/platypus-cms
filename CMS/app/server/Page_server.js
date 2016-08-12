/**
 * 
 * @author admin
 * @stateless
 * @public 
 */
define('Page_server', ['orm', 'page_display_API', 'page_creator_API'], function (Orm, Page_display_API, Page_creator_API, ModuleName) {
    function module_constructor() {
        var self = this
        , page_display_API = new Page_display_API()
        , page_creator_API = new Page_creator_API();

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
        
        self.getPageList = function (callback, error) {
            page_display_API.getPagesList(callback, error);
        };
        
        self.getPageInfo = function (aPageId, callback, error) {
            page_display_API.getPageInfo(aPageId, callback, error);
        };
        
        self.getMeta = function (aPageId, callback, error) {
            page_display_API.getMetaInformation(aPageId, callback, error);
        }
    }
    return module_constructor;
});
