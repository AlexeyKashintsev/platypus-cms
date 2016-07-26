/**
 * 
 * @author admin
 */
define('Form', ['orm', 'forms', 'ui', 'rpc', 'resource'], function (Orm, Forms, Ui, Rpc, Resource, ModuleName) {
    function module_constructor() {
        var self = this
                , model = Orm.loadModel(ModuleName)
                , form = Forms.loadForm(ModuleName, model)
                , Server = new Rpc.Proxy('MyServer')
                , FileUtils = new Rpc.Proxy('FileUtils');

        self.show = function () {
            form.show();
        };

        // TODO : place your code here

        form.button.onActionPerformed = function () {
            FileUtils.test('14654871357891.txt', function(Text) {
                console.log(Text);
            });
//            //console.log(Resource.load('s.jpg'));
//            //console.log(Resource.load('http://st1.styapokupayu.ru/images/product/009/969/753_small.jpg'));
////            FileUtils.loadFile('http://st1.styapokupayu.ru/images/product/009/969/753_small.jpg', '/222.jpg', function () {
////                    console.log('s');
////                    });
//            FileUtils.loadFile('s.jpg', '/111.jpg', function () {
//                    console.log('s');
//                    });
//            Server.insertItemFromServer({
//                name: '9.jpg',
//                description: 1,
//                type: 1,
//                url: '/9.jpg'
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
