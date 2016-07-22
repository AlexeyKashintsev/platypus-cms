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
            shofFrom: true,
            description: '',
            item_id: '',
            currentImage: function (img) {
                return img;
            },
            images: [],
            currentChecked: []
        },
        computed: {
            display: function () {
                console.log(shofFrom);
                return this.shofFrom;
            }
        },
        ready: function () {
            this.description = '';
            this.item_id = '';
            this.display = 'hidden';
            this.currentImage(this.getData(this.images)[0]);
        },
        methods: {
            getData: function (ImagesArr) {
                Server.getInfo(function (Data) {
                    ImagesArr.splice(0, ImagesArr.length);
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
            },
            onClick: function (e) {
                if (e === 1) {
                    Server.deleteItems(this.currentChecked, function (Text) {
                        console.log(Text);
                        var ImagesArr = this.images;
                        this.currentChecked.forEach(function (Data) {
                            for (var i = ImagesArr.length - 1; i >= 0; i--) {
                                if (ImagesArr[i].item_id === Data) {
                                    ImagesArr.splice(i, 1);
                                }
                            }
                        });
                        this.images = ImagesArr;
                    });
                }
                if (e === 2) {
                    Server.changeInfo(this.item_id, this.description, function (Text) {
                        console.log(Text);
                    });
                    for (var i = 0, length = this.images.length; i < length; i++) {
                        if (this.images[i].item_id === this.item_id) {
                            this.images[i].description = this.description;
                        }
                        ;
                    }
                    ;
                }
                if (e === 3) {
                    var currentChecked = this.currentChecked;
                    var ImagesArr = this.images;
                    Server.deleteItems(this.currentChecked, function () {
                        currentChecked.forEach(function (Data) {
                            for (var i = ImagesArr.length - 1; i >= 0; i--) {
                                if (ImagesArr[i].item_id === Data) {
                                    ImagesArr.splice(i, 1);
                                }
                            }
                        });
                    });
                    this.images = ImagesArr;
                }
            }
        },
        events: {
            'clickOnPreview': function (urlPreview) {
                for (var i = 0, length = this.images.length; i < length; i++) {
                    if (this.images[i].urlPreview === urlPreview) {
                        this.$broadcast('clickOnPreview', this.images[i]);
                        this.description = this.images[i].description;
                        this.item_id = this.images[i].item_id;
                    }
                    ;
                }
                ;
            },
            'clickOnPreviewCheckBox': function (checkBoxId, checkBox, urlPreview) {
                if (checkBox === 'true') {
                    this.currentChecked.push(checkBoxId);
                } else {
                    this.currentChecked.splice(this.currentChecked.indexOf(checkBoxId), 1);
                }
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
                    'clickOnPreview': function (data) {
                        this.urlOriginal = data.urlOriginal;
                    }
                }
            },
            'infoDescription': {
                template: '{{description}}',
                props: ['description'],
                events: {
                    'clickOnPreview': function (data) {
                        this.description = data.description;
                    }
                }
            },
            'infoName': {
                template: '{{name}}',
                props: ['name'],
                events: {
                    'clickOnPreview': function (data) {
                        this.name = data.name;
                    }
                }
            },
            'infoType': {
                template: '{{type}}',
                props: ['type'],
                events: {
                    'clickOnPreview': function (data) {
                        this.type = data.type;
                    }
                }
            },
            'checkBox': {
                template: '<input class="checkBoxId" style="position:absolute; margin:0px; right:0px; top:0px;" type="checkbox" v-on:click="clickCheckBox">',
                props: ['checkBoxId', 'checkBox', 'urlPreview'],
                ready: function () {
                    this.checkBox = 'false';
                },
                methods: {
                    clickCheckBox: function () {
                        if (this.checkBox === 'false')
                            this.checkBox = 'true';
                        else
                            this.checkBox = 'false';
                        this.$dispatch('clickOnPreviewCheckBox', this.checkBoxId, this.checkBox, this.urlPreview);
                    }
                }
            }
        }
    });
});
