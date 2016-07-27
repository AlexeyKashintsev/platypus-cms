require(['environment', 'id', 'resource', 'rpc'], function (F, id, Resource, Rpc) {
    var global = this;
    var Server;
    var SmallImageDirectory;

    global.loadImageFromPc = function (aFiles, ImagesArr, type, inputdescription, callback, error) {
        var currentCount = 0;
        var Images = new Array();
        var ImageItems = new Array();
        for (var s = 0; s < aFiles.length; s++) {
            (function (data) {
                //var extension = '.' + aUrl[0].split('.').pop();
                var Id = id.generate();
                Resource.upload(data, data.name,
                        function (aUrl) {
                            var extension = '.' + aUrl[0].split('.').pop();
                            currentCount++;
                            Images.push({
                                item_id: Id,
                                name: Id + extension,
                                type: type,
                                url: '/' + Id + extension,
                                description: inputdescription,
                                imgURL: aUrl[0]
                            });
                            ImageItems.push({
                                item_id: Id,
                                name: Id + extension,
                                description: inputdescription,
                                type: type,
                                urlOriginal: '/' + Id + extension,
                                urlPreview: SmallImageDirectory + Id + extension
                            });
                            if (currentCount === aFiles.length) {
                                Server.insertItem(Images, function () {
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
                                    callback('Succes');
                                }, function (err) {
                                    error(err);
                                });
                            }
                        },
                        function (aEvent) {
                        },
                        function (aError) {
                            error(aError);
                            alert("Uploading is aborted with message: " + aError);
                        });
            })(aFiles[s]);
        }
    };

    global.loadImageViaUrl = function (Url, ImagesArr, type, inputdescription, calback, error) {
        var Id = id.generate();
        var extension = '.' + Url.split('.').pop();
        var Image = new Array();
        Image.push({
            item_id: Id,
            name: Id + extension,
            type: type,
            url: '/' + Id + extension,
            description: inputdescription,
            imgURL: Url
        });
        Server.insertItem(Image, function () {
            ImagesArr.push({
                item_id: Id,
                name: Id + extension,
                description: inputdescription,
                type: type,
                urlOriginal: '/' + Id + extension,
                urlPreview: SmallImageDirectory + Id + extension
            });
            calback('Succes');
        }, function (err) {
            error(err);
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
                inputType: '',
                inputDescription: '',
                inputurl: '',
                displayload1: true,
                displayload2: false,
                files: [],
                inputUrl: [],
                currentImageId: ''
            },
            ready: function () {
                this.description = '';
                this.inputDescription = '';
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
                },
                changeFormState: function () {
                    this.display = !this.display;
                    this.errorMsg = '';
                },
                changeDescription: function () {
                    Server.changeInfo(this.item_id, this.description, function () {});
                    for (var i = 0, length = this.images.length; i < length; i++) {
                        if (this.images[i].item_id === this.item_id) {
                            this.images[i].description = this.description;
                        }
                    }
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
                    if (this.inputType === '' || this.inputDescription === '') {
                        this.errorMsg = 'Not all fields allowed!';
                    } else {
                        var self = this;
                        this.errorMsg = 'Loading';
                        if (this.displayload1) {
                            (new Promise(function (Resolve, Reject) {
                                global.loadImageFromPc(self.files, self.images, self.inputType, self.inputDescription, Resolve, Reject);
                            })).then(function (res) {
                                self.errorMsg = 'Loading ' + res;
                            }, function (err) {
                                self.errorMsg = 'Loading failed: ' + err;
                            });
                        } else {
                            (new Promise(function (Resolve, Reject) {
                                global.loadImageViaUrl(self.inputUrl, self.images, self.inputType, self.inputDescription, Resolve, Reject);
                            })).then(function (res) {
                                self.errorMsg = 'Loading ' + res;
                            }, function (err) {
                                self.errorMsg = 'Loading failed: ' + err;
                            });
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
                'clickOnPreview': function (urlPreview, aCtrlClick) {
                    for (var i = 0, length = this.images.length; i < length; i++) {
                        if (this.images[i].urlPreview === urlPreview) {
                            if (aCtrlClick) {
                                this.$broadcast('ctrlClickOnPreview', this.images[i].item_id);
                                if (this.currentImageId === this.images[i].item_id) {
                                    this.$broadcast('clickOnPreview', this.images[i]);
                                }
                            } else {
                                this.$broadcast('clickOnPreview', this.images[i]);
                                this.description = this.images[i].description;
                                this.item_id = this.images[i].item_id;
                                this.currentImageId = this.images[i].item_id;
                            }
                        }
                    }
                },
                'clickOnPreviewCheckBox': function (checkBoxId, checkBox) {
                    if (checkBox) {
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
                    template: '<img v-bind:src="urlPreview" v-on:click="loadOriginal" :style="MyStyle">',
                    props: ['urlPreview', 'MyStyle'],
                    ready: function() {
                            this.MyStyle = {
                                    border: "5px solid white"
                                };
                    },
                    methods: {
                        loadOriginal: function (e) {
                            this.$dispatch('clickOnPreview', this.urlPreview, e.ctrlKey);
                        }
                    },
                    events: {
                        'clickOnPreview': function (data) {
                            if (this.urlPreview === data.urlPreview) {
                                this.MyStyle = {
                                    border: "5px solid red"
                                };
                            } else {
                                this.MyStyle = {
                                    border: "5px solid white"
                                };
                            }
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
                    template: '<input class="checkBoxId" style="position:absolute; margin: 0px; right: 0px; top: 0px;" type="checkbox" v-on:click="clickCheckBox" v-model="checkBox">',
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
                        },
                        'ctrlClickOnPreview': function (imgId) {
                            if (imgId === this.checkBoxId) {
                                this.checkBox = !this.checkBox;
                                this.$dispatch('clickOnPreviewCheckBox', this.checkBoxId, !this.checkBox);
                            }
                        }
                    }
                }
            }
        });
    }, function (err) {
    });
});
