require(['environment', 'Server'], function (F, S) {
    var global = this;
    var Server = new S();
    F.cacheBust(true);
    var SmallImageDirectory;
    Server.getSmallImageDirectory(function (Text) {
        SmallImageDirectory = Text;
    });
    new Vue({
        el: '#imageViewer',
        data: {
            currentImage: function (img) {
                return img;
            },
            images: []
        },
        ready: function () {
            this.currentImage(this.getData(this.images)[0]);
        },
        methods: {
            getData: function (ImagesArr) {
                Server.getInfo(function (Data) {
                    for (i = 0; i < Data.length; i++) {
                        ImagesArr.push({
                            item_id: Data[i].item_id,
                            name: Data[i].name,
                            description: Data[i].description,
                            type: Data[i].type,
                            urlOriginal: Data[i].url,
                            urlPreview: SmallImageDirectory + Data[i].name
                        });
                    }
                    ;
                });
                return ImagesArr;
            }
        },
        events: {
            'clickOnPreview': function (urlPreview) {
                for (var i = 0, length = this.images.length; i < length; i++) {
                    if (this.images[i].urlPreview === urlPreview) {
                        this.$broadcast('clickOnPreview', this.images[i].urlOriginal);
                    }
                    ;
                }
                ;
            }
        },
        components: {
            'imagePreview': {
                template: '<img v-bind:src="urlPreview" v-on:click="loadOriginal">',
                props: ['urlPreview'],
                methods: {
                    loadOriginal: function () {
                        this.$dispatch('clickOnPreview', this.urlPreview);
                    }
                },
                watch: {
                    urlPreview: function () {
                        console.log('urlPreview changed!');
                    }
                }
            },
            'imageOriginal': {
                template: '<img v-bind:src="urlOriginal">',
                props: ['urlOriginal'],
                events: {
                    'clickOnPreview': function (urlOriginal) {
                        this.urlOriginal = urlOriginal;
                    }
                }
            }
        }
    });
});