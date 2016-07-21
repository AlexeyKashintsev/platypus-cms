/**
 * 
 * @author admin
 */
define('Form', ['orm', 'forms', 'ui', 'rpc'], function (Orm, Forms, Ui, Rpc, ModuleName) {
    function module_constructor() {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = Forms.loadForm(ModuleName, model)
                , Server = new Rpc.Proxy('Server')
                , FileUtils = new Rpc.Proxy('FileUtils');

        self.show = function () {
            form.show();
        };

        // TODO : place your code here

        form.button.onActionPerformed = function () {
//            Server.insertItemFromServer({
//                name: '2.jpg',
//                description: 1,
//                type: 1,
//                url: '/2.jpg'
//            },
//                    'http://st1.styapokupayu.ru/images/product/009/969/753_small.jpg', function (Text) {
//                        console.log(Text);
//                    }, function (Text) {
//                console.log(Text);
//            });
//            Server.getInfo(function(Data) {
//                console.log(Data);
//            });
//            Server.getSmallImageDirectory(function(Text) {
//                console.log(Text);
//            });
        };

        model.requery(function () {
            // TODO : place your code here
        });

    }
    return module_constructor;
});
