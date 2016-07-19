/**
 * 
 * @author sa
 * @stateless
 * @public 
 */
define('FileUtils', [], function (ModuleName) {
    function module_constructor() {
        var self = this,
                Files = Java.type('java.nio.file.Files'),
                Paths = Java.type('java.nio.file.Paths'),
                ImageIo = Java.type('javax.imageio.ImageIO'),
                BufferedImage = Java.type('java.awt.image.BufferedImage'),
                FileClass = Java.type("java.io.File");

        self.ChangeSize = function (aImageDirectory, aOutputDirectory, aFormat, callback) {
            var OurImage = ImageIo.read(new FileClass(aImageDirectory));
            var newWidth, newHeight;
            if (OurImage.width > OurImage.height)
            {
                newWidth = 60;
                newHeight = (newWidth / OurImage.width) * OurImage.height;
            } else {
                newHeight = 60;
                newWidth = (newHeight / OurImage.height) * OurImage.width;
            }
            var scaled = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
            var g = scaled.createGraphics();
            g.drawImage(OurImage, 0, 0, newWidth, newHeight, null);
            g.dispose();
            ImageIo.write(scaled, aFormat, new FileClass(aOutputDirectory));
            callback('Succes!');
        };

        self.CopyFile = function (aFromDirectory, aIntoDirectory, callback) {
            Files.copy(Paths.get(aFromDirectory), Paths.get(aIntoDirectory));
            callback('Succes!');
        };

        self.RenameFile = function (aSource, aDest, callback) {
            (new FileClass(aSource)).renameTo(new FileClass(aDest));
            callback('Succes!');
        };

    }
    return module_constructor;
});
