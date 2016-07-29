/**
 * 
 * @author sa
 * @stateless
 * @public 
 */
define('FileUtils', ['resource', 'Settings'], function (Resource, Settings, ModuleName) {
    function module_constructor() {
        var self = this,
                Files = Java.type('java.nio.file.Files'),
                Paths = Java.type('java.nio.file.Paths'),
                File = Java.type("java.io.File"),
                FileOutputStream = Java.type('java.io.FileOutputStream');
        var localPath = Settings.localPath;
        var localTempPath = Settings.localTempPath;
        
        /*
         * @get /createFile
         */
        self.createFile = function (aByteArr, anIntoDirectory, callback, err) {
            var path = new File(localPath + anIntoDirectory);
            path.createNewFile();
            var fileOut = new FileOutputStream(path);
            fileOut.write(aByteArr);
            fileOut.close();
            callback('Succes!');
        };

        /*
         * @get /copyFile
         */
        self.copyFile = function (aFromDirectory, anIntoDirectory, callback, err) {
            Files.copy(Paths.get(aFromDirectory), Paths.get(anIntoDirectory));
            callback('Succes!');
        };
        
        /*
         * @get /renameFile
         */
        self.renameFile = function (aSource, aDest, callback, err) {
            (new File(aSource)).renameTo(new File(aDest));
            callback('Succes!');
        };

        /*
         * @get /deleteFile
         */
        self.deleteFile = function (aFromDirectory, callback, err) {
            var file = new File(localPath + aFromDirectory);
            file.delete();
            callback('Succes!');
        };
        
        /*
         * @get /deleteTempFile
         */
        self.deleteTempFile = function(aFromDirectory, callback, error) {
            aFromDirectory = aFromDirectory.split('/').pop();
            var file = new File(localTempPath + aFromDirectory);
            file.delete();
            callback('Succes!');
        };
    }
    return module_constructor;
});
