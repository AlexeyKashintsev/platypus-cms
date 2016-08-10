/**
 * 
 * @author admin
 * @stateless
 * @public 
 */
define('ImageUtils', ['resource', 'Settings', 'FileUtils'], function (Resource, Settings, fileUtils, ModuleName) {
    function module_constructor() {
        var self = this,
        FileUtils = new fileUtils(),
        ImageIo = Java.type('javax.imageio.ImageIO'),
        File = Java.type("java.io.File"),
        BufferedImage = Java.type('java.awt.image.BufferedImage');

        var SmallImageSize = Settings.SmallImageSize;
        var localPath = Settings.localPath;
        var SmallImageDirectory = Settings.SmallImageDirectory;
        /*
         * @get /deleteImage
         */
        self.deleteImage = function (aFromDirectory, callback, err) {
            var file = new File(localPath + aFromDirectory);
            file.delete();
            file = new File(localPath + SmallImageDirectory + aFromDirectory);
            file.delete();
            callback('Succes!');
        };

        self.processLoadedImageFile = function (aFromDirectory, anIntoDirectory, callback, err) {
            var obj = Resource.load(encodeURI(aFromDirectory));
            FileUtils.createImageFile(obj, anIntoDirectory, function() {});
            FileUtils.createImageFile(obj, SmallImageDirectory + anIntoDirectory, function() {});
            callback('Success');
        };

        self.changeSize = function (anInputPath, anOutputPath, aSuccess, anError) {
            anInputPath = localPath + anInputPath;
            anOutputPath = localPath + anOutputPath;
            var OurImage = ImageIo.read(new File(anInputPath));
            var newWidth, newHeight;
            var Format = anOutputPath.split('.').pop();
            if (OurImage.width > OurImage.height) {
                newWidth = SmallImageSize;
                newHeight = (newWidth / OurImage.width) * OurImage.height;
            } else {
                newHeight = SmallImageSize;
                newWidth = (newHeight / OurImage.height) * OurImage.width;
            }
            if (Format === 'png') {
                var scaled = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_4BYTE_ABGR_PRE);
            } else {
                var scaled = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
            }
            var g = scaled.createGraphics();
            g.drawImage(OurImage, 0, 0, newWidth, newHeight, null);
            g.dispose();
            ImageIo.write(scaled, Format, new File(anOutputPath));
            aSuccess('Succes!');
        };
    }
    return module_constructor;
});
