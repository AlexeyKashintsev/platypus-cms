/**
 * 
 * @author admin
 * @stateless
 * @public 
 */
define('page_display_API', ['orm'], function (Orm, ModuleName) {
    function module_constructor() {
        var self = this, model = Orm.loadModel(ModuleName);
        
        /*
         * @get /getPagesList
         */
        self.getPagesList = function (callback, error) {
            model.qGetPages.query({}, callback, error);
        };

        /*
         * @get /getMetaInformation
         */
        self.getMetaInformation = function (aPageID, callback, error) {
            model.qGetPagesMetaInfo.query({aPageID: +aPageID}, callback, error);
        };

        /*
         * @get /getTemplateInformation
         */
        self.getTemplateInformation = function (aPageID, callback, error) {
            model.qGetPagesTemplateInfo.query({aPageID: +aPageID}, callback, error);
        };

        /*
         * @get /getPageWidgets
         */
        self.getPageWidgets = function (aTemplateId, callback, error) {
            model.qGetTemplateWidgets.query({aTemplateId: +aTemplateId}, callback, error);
        };
    }
    return module_constructor;
});
