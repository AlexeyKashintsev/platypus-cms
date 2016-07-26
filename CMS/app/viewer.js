require(['environment', 'id', 'resource', 'rpc'], function (F, id, Resource, Rpc) {
    var global = this;
    var Server;
    var SmallImageDirectory;

    global.loadImageFromPc = function (aFiles, ImagesArr, type, inputdescription) {
        var currentCount = 0;
        var Items = new Array();
        var ImageItems = new Array();
        aFiles.forEach(function (data) {
            var Id = id.generate();
            Resource.upload(data, data.name,
                    function (aUrl) {
                        currentCount++;
                        Items.push({
                            item_id: Id,
                            name: data.name,
                            type: type,
                            url: '/' + data.name,
                            description: inputdescription,
                            imgURL: aUrl[0]
                        });
                        ImageItems.push({
                            item_id: Id,
                            name: data.name,
                            description: inputdescription,
                            type: type,
                            urlOriginal: '/' + data.name,
                            urlPreview: SmallImageDirectory + data.name
                        });
                        if (currentCount === aFiles.length) {
                            Server.insertItem(Items, function () {
                                ImageItems.forEach(function (anItem) {
                                    ImagesArr.push({
                                        item_id: anItem.item_id,
                                        name: anItem.name,
                                        description: anItem.description,
                                        type: anItem.type,
                                        urlOriginal: anItem.urlOriginal,
                                        urlPreview: anItem.urlPreview
                                    });
                                });
                            });
                        }
                    },
                    function (aEvent) {
                    },
                    function (aError) {
                        alert("Uploading is aborted with message: " + aError);
                    });
        });
    };

    global.loadImageViaUrl = function (Url, ImagesArr, type, inputdescription) {
        var Id = id.generate();
        Server.insertItem({
            item_id: Id,
            name: name + '.jpg',
            type: type,
            url: '/' + name + '.jpg',
            description: inputdescription
        }, Url, function () {
            ImagesArr.push({
                item_id: Id,
                name: name + '.jpg',
                description: inputdescription,
                type: type,
                urlOriginal: '/' + name + '.jpg',
                urlPreview: SmallImageDirectory + name + '.jpg'
            });
        });
    };

    var promise = new Promise(function (Resolve, Reject) {
        Rpc.requireRemotes('MyServer', function (serv) {
            Server = serv;
            Server.getSmallImageDirectory(function (Text) {
                SmallImageDirectory = Text;
                Resolve('Success');
            });
        });
    });

    promise.then(function (result) {
        F.cacheBust(true);
        new Vue({
            el: '#imageViewer',
            data: {
                description: '',
                item_id: '',
                currentImage: function (img) {
                    return img;
                },
                images: [],
                currentChecked: [],
                display: false,
                errorMsg: '',
                inputName: '',
                inputType: '',
                inputDescription: '',
                inputurl: '',
                dile: '',
                displayload1: true,
                displayload2: false,
                files: [],
                inputUrl: ''
            },
            ready: function () {
                this.description = '';
                this.inputDescription = '';
                this.item_id = '';
                this.inputUrl = '';
                this.files.splice(0, this.files.length);
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
                onFileChange: function (e) {
                    this.files = e.target.files || e.dataTransfer.files;
                    console.log(this.files);
                },
                changeFormState: function () {
                    this.display = !this.display;
                },
                changeDescription: function () {
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
                },
                deleteItems: function () {
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
                        currentChecked.splice(0, currentChecked.length);
                    });
                    this.$dispatch('clickOnDeleteButton');
                    this.images = ImagesArr;
                },
                onClickLoadItem: function () {
                    if (this.inputName === '' || this.inputType === '' || this.inputDescription === '') {
                        this.errorMsg = 'Not all fields allowed!';
                    } else {
                        this.errorMsg = '';
                        if (this.displayload1) {
                            global.loadImageFromPc(this.files, this.images, this.inputType, this.inputDescription);
                        } else {
                            global.loadImageViaUrl(this.inputUrl, this.images, this.inputType, this.inputDescription);
                        }
                    }
                },
                displayInputFromPc: function () {
                    this.displayload1 = true;
                    this.displayload2 = false;
                },
                displayInputViaUrl: function () {
                    this.displayload1 = false;
                    this.displayload2 = true;
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
                'clickOnPreviewCheckBox': function (checkBoxId, checkBox) {
                    console.log(checkBoxId);
                    console.log(checkBox);
                    if (checkBox === true) {
                        this.currentChecked.push(checkBoxId);
                    } else {
                        this.currentChecked.splice(this.currentChecked.indexOf(checkBoxId), 1);
                    }
                },
                'clickOnDeleteButton': function () {
                    this.$broadcast('clickOnDelete');
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
                            console.log(data.urlOriginal);
                            this.urlOriginal = data.urlOriginal;
                            console.log(this.urlOriginal);
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
                    template: '<input class="checkBoxId" style="position:absolute; margin:0px; right:0px; top:0px;" type="checkbox" v-on:click="clickCheckBox" v-model="checkBox">',
                    props: ['checkBoxId', 'urlPreview'],
                    data: function () {
                        return {
                            checkBox: false
                        };
                    },
                    methods: {
                        clickCheckBox: function () {
                            this.$dispatch('clickOnPreviewCheckBox', this.checkBoxId, !this.checkBox);
                        }
                    },
                    events: {
                        'clickOnDelete': function () {
                            this.checkBox = false;
                        }
                    }
                }
            }
        });
    }, function (err) {
    });
});
