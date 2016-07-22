/**
 * 
 * @author admin
 */
define('Form_language', ['orm', 'forms', 'ui'], function (Orm, Forms, Ui, ModuleName) {
    function module_constructor(height, width) {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = Forms.loadForm(ModuleName, model);

        self.show = function (aPanel) {
            var cont = aPanel ? (typeof (aPanel) === 'object' ? aPanel
                    : document.getElementById(aPanel))
                    : self.container;
            if (cont) {
                if (cont.add)
                    cont.add(form.view, {left: 0, top: 0, right: 0, bottom: 0});
                else
                    form.view.showOn(cont);
                if (form.onWindowOpened)
                    form.onWindowOpened();
            } else
                form.show();
        };
        form.view.width = width;
        form.view.height = height;
        self.changeSize = function (height, width) {
            form.view.width = width;
            form.view.height = height;
        };
    }
    return module_constructor;
});
