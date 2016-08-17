/**
 *
 * @author admin
 * @stateless
 * @public
 */
define('page_creator_API', ['Settings', 'files', 'FileUtils', 'logger', 'widget_API'], function (Settings, Plat_Files, fileUtils, Logger, Widget_API, ModuleName) {
    function module_constructor() {
        var self = this;
        var localPagePath = Settings.localPagePath;
        var FileUtils = new fileUtils();
        var widget_API = new Widget_API();

        /*
         * @get /createTemplate
         */
        self.createTemplate = function (aName, aStyles, callback, error) {
            FileUtils.copyFile(localPagePath + 'Template/' + 'PageTemplate.html', localPagePath + aName + '.html', function () {
                FileUtils.copyFile(localPagePath + 'Template/' + 'VueTemplate.js', localPagePath + 'VueTemplate.js', function () {
                    FileUtils.copyFile(localPagePath + 'Template/' + 'vue.js', localPagePath + 'vue.js', function () {
                        FileUtils.createFile(localPagePath + 'styles.css', function (Text) {
                            Plat_Files.write(localPagePath + 'styles.css', aStyles);
                            callback(Text);
                        }, error);
                    }, error);
                }, error);
            }, error);
        };

        /*
         * @get /inputMetaInfo
         */
        self.inputMetaInfo = function (aName, aMetaInfo, callback, error) {
            var str = Plat_Files.read(localPagePath + aName + '.html');
            str = str.replace('<%MetaInfo%>', aMetaInfo);
            Plat_Files.write(localPagePath + aName + '.html', str);
            callback('Succes');
        };

        /*
         * @get /inputTemplate
         */
        self.inputRootTemplate = function (aName, aRootTemplate, callback, error) {
            var str = Plat_Files.read(localPagePath + aName + '.html');
            str = str.replace('<%Template%>', aRootTemplate);
            Plat_Files.write(localPagePath + aName + '.html', str);
            callback('Succes');
        };

        /*
         * @get /inputTemplate
         */
        self.inputTemplate = function (aName, aTemplate, callback, error) {
            var str = Plat_Files.read(localPagePath + aName + '.html');
            aTemplate.forEach(function (Temp) {
                str = str.replace(Temp.template_name, Temp.layout);
            });
            Plat_Files.write(localPagePath + aName + '.html', str);
            callback('Succes');
        };

        /*
         * @get /inputVueWidget
         */
        self.inputVueWidget = function (aLayout, callback, error) {
//          добавление компонента
            var str = Plat_Files.read(localPagePath + 'VueTemplate' + '.js');
            var str1 = str.substr(str.indexOf('components: {') + 13);
            str = str.slice(0, str.indexOf('components: {') + 13);
            str = str.concat(aLayout);
            str = str.concat(str1);
            Plat_Files.write(localPagePath + 'VueTemplate' + '.js', str);
            callback('Succes');
        };

        /*
         * @get /inputHtmlWidget
         */
        self.inputHtmlWidget = function (aName, aWidName, callback, error) {
            //замена в html разметке поля для виджета на его теги
            var str = Plat_Files.read(localPagePath + aName + '.html');
            aWidName = aWidName.replace('<%', '');
            aWidName = aWidName.replace('%>', '');
            str = str.replace('<%' + aWidName + '%>', '<' + aWidName + '>' + '</' + aWidName + '>');
            Plat_Files.write(localPagePath + aName + '.html', str);
        };

        /*
         * @get /createPage
         */
        self.createPage = function (aPageName, aMetaInfo, aRootTemplate, aTemplate, aHtmlTemplate, aWidget, callback, error) {
            self.createTemplate(aPageName, aRootTemplate.styles, function () {
                self.inputMetaInfo(aPageName, aMetaInfo, function () {
                    self.inputRootTemplate(aPageName, aRootTemplate.root_layout, function () {
                        self.inputTemplate(aPageName, aTemplate, function () {
                            aHtmlTemplate.forEach(function (cat) {
                                self.inputHtmlWidget(aPageName, cat);
                            });
                            aWidget.forEach(function (data) {
                                var str1 = data.layout.substr(data.layout.indexOf(',') + 1);
                                data.layout = data.layout.slice(0, data.layout.indexOf(',') + 1);
                                data.layout = data.layout + '\n\t\data: function() {\n\t\t\ return {' + str1;
                                widget_API.getTextFromTemplate(data.layout, function (data_fields) {
                                    var data_fields_length = data_fields.length;
                                    for (var i = 0; i < data_fields_length; i++) {
                                        if (data_fields[i] === data.data_name) {
                                            if (i === 0) {
                                                str1 = data.layout.substr(data.layout.indexOf('return {') + 8);
                                                data.layout = data.layout.slice(0, data.layout.indexOf('return {') + 8);
                                            }
                                            data.layout = data.layout + '\n\t\t\t' + data_fields[i] + ': ' + "'" + data.data_value + "'" + ',';
                                            if (i === data_fields_length - 1)
                                                data.layout = data.layout + '\n\t\t\}' + '\n\t\},' + str1;
                                        }
                                    }
                                });
                                data.layout = data.layout.replace(/\n/g, '\n\t\t\t');
                                data.layout = '\n\t\t\t' + data.layout;
                                self.inputVueWidget(data.layout, function () {}, error);
                            });
                            callback('succes');
                        }, error);
                    });
                }, error);
            }, error);
        };

    }
    return module_constructor;
});
