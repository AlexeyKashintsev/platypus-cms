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
    return Settings;
});
