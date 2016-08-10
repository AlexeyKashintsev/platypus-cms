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
                , page_creator = new Rpc.Proxy('FileUtils')
                , page_editor = new Rpc.Proxy('page_editor_API')
                , page_creator = new Rpc.Proxy('page_creator_API')
                , page_display_API = new Rpc.Proxy('page_display_API')
                , Page_server = new Rpc.Proxy('Page_server');
        ;
        self.show = function () {
            form.show();
        };
        // TODO : place your code here

        form.button1.onActionPerformed = function () {
            Page_server.createPage(147003666896600, function (Text) {
                console.log(Text);
            }
            , function (err) {
                console.log(err);
            });
//            
//            
//            page_editor.changePageMetaInfo( 147064012341900, '321', function (s) {
//                console.log(s);
//            });
//            
//            
//            page_editor.changePageWidgets(147064195722000, [147039208507000, 147038210462900, 147004375769400], function (s) {
//                console.log(s);
//            });
//            
//            
//        page_display_API.getPagesList(function (data) {
//            console.log(data);
//        });

//            page_editor.createRootTemplateTemplate('main', function(s) {
//                console.log(s);
//            });
        };
        form.button.onActionPerformed = function () {
//            page_editor.deletePage(147003923911400, function(Text) {
//                console.log(Text);
//            });
            var Meta = '<title>test</title>\n\
    ' + '<meta charset="utf-8">\n\
    ' + '<meta name="description" content="Free Web tutorials" />\n\
    ' + '<meta name="keywords" content="HTML,CSS,XML,JavaScript" /> \n\
    ' + '<meta name="author" content="Hege Refsnes" />';
            var RootTemplate = '<%header%>\n\
    <%content%>\n\
    <%footer%>';
            var Template = [{
                    template_name: '<%header%>',
                    layout: '<%widget1%>'
                }, {
                    template_name: '<%content%>',
                    layout: '    <%widget1%>'
                }, {
                    template_name: '<%footer%>',
                    layout: '    {{name}}'
                }];
            var WidgetLayout = "\n\
            'widget1': {\n\
                template: '{{name}}',\n\
                data: function() {\n\
                    return {\n\
                        name: <%data%>\n\
                    }\n\
                },\n\
            },";
            page_creator.createPage('1', Meta, RootTemplate, Template, [{name: 'widget1', layout: WidgetLayout}, {name: 'widget1', layout: WidgetLayout}],
                    [{data_name: 'data', data_value: 'rofl '}, {data_name: 'data', data_value: 'rofl '}], function (Text) {
                console.log(Text);
            }, function (err) {
                console.log(err);
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
