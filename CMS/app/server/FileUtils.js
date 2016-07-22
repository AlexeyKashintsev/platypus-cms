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
                ImageIo = Java.type('javax.imageio.ImageIO'),
                BufferedImage = Java.type('java.awt.image.BufferedImage'),
                FileClass = Java.type("java.io.File"),
                FileOutputStream = Java.type('java.io.FileOutputStream');
        
        var SmallImageSize = Settings.SmallImageSize;
        
        self.changeSize = function (anImageDirectory, anOutputDirectory, callback, err) {
            var OurImage = ImageIo.read(new FileClass(anImageDirectory));
            var newWidth, newHeight, i = anOutputDirectory.length - 1;
            var Format = '';
            while (anOutputDirectory[i] !== '.') {
                Format += anOutputDirectory[i];
                i--;
            }
            Format = Format.split("").reverse().join("");
            if (OurImage.width > OurImage.height)
            {
                newWidth = SmallImageSize;
                newHeight = (newWidth / OurImage.width) * OurImage.height;
            } else {
                newHeight = SmallImageSize;
                newWidth = (newHeight / OurImage.height) * OurImage.width;
            }
            var scaled = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
            var g = scaled.createGraphics();
            g.drawImage(OurImage, 0, 0, newWidth, newHeight, null);
            g.dispose();
            ImageIo.write(scaled, Format, new FileClass(anOutputDirectory));
            callback('Succes!');
        };
        
        self.createFile = function(aByteArr, anIntoDirectory, callback, err) {
            var sad = new FileClass(anIntoDirectory);
            sad.createNewFile();
            var abc = new FileOutputStream(sad);
            abc.write(aByteArr);
            abc.close();
            callback('Succes!');
        };
        
        self.loadFile = function (aFromDirectory, anIntoDirectory, callback, err) {
            var obj = Resource.load(aFromDirectory);
            self.createFile(obj, anIntoDirectory, function(Text) {
                callback(Text);
            });
        };
        
        self.copyFile = function (aFromDirectory, anIntoDirectory, callback, err) {
            Files.copy(Paths.get(aFromDirectory), Paths.get(anIntoDirectory));
            callback('Succes!');
        };

        self.renameFile = function (aSource, aDest, callback, err) {
            (new FileClass(aSource)).renameTo(new FileClass(aDest));
            callback('Succes!');
        };

        self.deleteFile = function (aFromDirectory, callback, err) {
            var File = new FileClass('C://Repos/platypus-cms/CMS/static' + aFromDirectory);
            File.delete();
            File = new FileClass('C://Repos/platypus-cms/CMS/static/small_image' + aFromDirectory);
            File.delete();
            callback('Succes!');
        };
    }
    return module_constructor;
});
