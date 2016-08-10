/**
 * 
 * @author admin
 * @stateless
 * @public 
 */
define('Settings', [], function () {
    var Settings = {};
        Object.defineProperty(Settings, 'SmallImageDirectory', {value: '/small_image/'});
        Object.defineProperty(Settings, 'SmallImageSize', {value: 60});
        Object.defineProperty(Settings, 'Context', {value: '/cms'});
        Object.defineProperty(Settings, 'localPath', {value: '/Repos/platypus-cms/CMS/static/'});
        Object.defineProperty(Settings, 'localTempPath', {value: '/Repos/platypus-cms/CMS/pub/'});
        Object.defineProperty(Settings, 'localPagePath', {value: '/Repos/platypus-cms/CMS/pages/'});
    return Settings;
});
