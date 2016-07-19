/**
 * @public
 * @author lapsh
 */
define('router', ['orm', 'http-context'], function (Orm, HttpContext, ModuleName) {
    function module_constructor() {
        var self = this, model = Orm.loadModel(ModuleName);
        
        
        /**
         * @get /router
         * @returns {undefined}
         */
        self.execute = function (path, success, error) {
            var http = new HttpContext();
            success("Route is: " + http.request.requestURI);
        };
    }
    return module_constructor;
});
