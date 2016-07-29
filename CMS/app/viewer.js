require(['environment', 'id', 'resource', 'rpc'], function (F, id, Resource, Rpc) {
    var global = this;
    var Server;
    var SmallImageDirectory;

    global.loadImageFromPc = function (aFiles, ImagesArr, name, inputdescription, callback, error) {
        var currentCount = 0;
        var Images = new Array();
        var ImageItems = new Array();
        for (var s = 0; s < aFiles.length; s++) {
            (function (data) {
                //var extension = '.' + aUrl[0].split('.').pop();
                var Id = id.generate();
                Resource.upload(data, data.name,
                        function (aUrl) {
                            var Name;
                            if (name === '') {
                                Name = data.name;
                            } else {
                                Name = name;
                            }
                            var extension = '.' + aUrl[0].split('.').pop();
                            var promiseGetType = new Promise(function (Resolve, Reject) {
                                Server.getType(extension, Resolve, Reject);
                            });
                            promiseGetType.then(function (result) {
                                currentCount++;
                                Images.push({
                                    item_id: Id,
                                    name: Name,
                                    type: result[0].type,
                                    url: '/' + Id + extension,
                                    description: inputdescription,
                                    imgURL: aUrl[0]
                                });
                                ImageItems.push({
                                    item_id: Id,
                                    name: Name,
                                    description: inputdescription,
                                    type: result[0].type,
                                    urlOriginal: '/' + Id + extension,
                                    urlPreview: SmallImageDirectory + Id + extension
                                });
                                if (currentCount === aFiles.length) {
                                    Server.insertItem(Images, extension, function () {
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
                                        Images.forEach(function (anImages) {
                                            Server.deleteTempFile(anImages.imgURL, function () {
                                                callback('succes');
                                            }, function (err) {
                                                error('Delete local files failed: ' + err);
                                            });
                                        });
                                    }, function (err) {
                                        error(err);
                                    });
                                }
                            }, function (err) {
                                console.log('Identify type failed: ' + data.name);
                            });
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

    global.loadImageViaUrl = function (Url, ImagesArr, name, inputdescription, calback, error) {
        var Id = id.generate();
        var extension = '.' + Url.split('.').pop();
        Server.getType(extension, function (Types) {
            var Name;
            if (name === '') {
                Name = Url.split('/').pop();
            } else {
                Name = name;
            }
            var Image = new Array();
            Image.push({
                item_id: Id,
                name: Name,
                type: Types[0].type,
                url: '/' + Id + extension,
                description: inputdescription,
                imgURL: Url
            });
            Server.insertItem(Image, extension, function () {
                ImagesArr.push({
                    item_id: Id,
                    name: Name,
                    description: inputdescription,
                    type: Types[0].type,
                    urlOriginal: '/' + Id + extension,
                    urlPreview: SmallImageDirectory + Id + extension
                });
                calback('succes');
            }, function (err) {
                error(err);
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
                inputDescription: '',
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
                            var extension = '.' + Data[i].url.split('.').pop();
                            ImagesArr.push({
                                item_id: Data[i].item_id,
                                name: Data[i].name,
                                description: Data[i].description,
                                type: Data[i].type,
                                urlOriginal: Data[i].url,
                                urlPreview: SmallImageDirectory + Data[i].item_id + extension
                            });
                        }
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
                    var self = this;
                    if (this.currentImageId === '') {
                        alert('Error');
                    } else {
                        Server.changeInfo(this.currentImageId, this.description, function () {
                            for (var i = 0, length = self.images.length; i < length; i++) {
                                if (self.images[i].item_id === self.item_id) {
                                    self.images[i].description = self.description;
                                }
                            }
                        }, function (err) {
                            alert(err);
                        });
                    }
                },
                changeName: function () {
                    var self = this;
                    if (this.currentImageId === '') {
                        alert('Error');
                    } else {
                        var name = prompt('Input name');
                        if (name) {
                            Server.changeName(this.currentImageId, name, function (res) {
                                for (var i = 0, length = self.images.length; i < length; i++) {
                                    if (self.images[i].item_id === self.item_id) {
                                        self.images[i].name = name;
                                        self.$broadcast('clickOnPreview', self.images[i]);
                                    }
                                }
                            }, function (err) {
                                alert(err);
                            });
                        }
                    }
                },
                deleteCurrentItem: function () {
                    var self = this;
                    if (self.currentImageId !== '') {
                        Server.deleteImage([this.currentImageId], function () {
                            self.$dispatch('clearOriginalForm');
                            for (var i = self.images.length - 1; i >= 0; i--) {
                                if (self.images[i].item_id === self.currentImageId) {
                                    self.images.splice(i, 1);
                                    self.currentImageId = '';
                                    break;
                                }
                            }
                        });
                    }
                },
                deleteItems: function () {
                    var self = this;
                    var status = false;
                    Server.deleteImage(self.currentChecked, function () {
                        (new Promise(function (res, err) {
                            self.currentChecked.forEach(function (Data) {
                                if (Data === self.currentImageId) {
                                    self.$dispatch('clearOriginalForm');
                                    status = true;
                                }
                                for (var i = self.images.length - 1; i >= 0; i--) {
                                    if (self.images[i].item_id === Data) {
                                        self.images.splice(i, 1);
                                    }
                                }
                            });
                            res('true');
                        })).then(function (res) {
                            if (!status) {
                                for (var i = self.images.length - 1; i >= 0; i--) {
                                    if (self.images[i].item_id === self.currentImageId) {
                                        self.$broadcast('clickOnPreview', self.images[i]);
                                    }
                                }
                            }
                            self.currentChecked.splice(0, self.currentChecked.length);
                        }, function (err) {});

                    });
                    this.$dispatch('clickOnDeleteButton');
                },
                onClickLoadItem: function () {
                    var self = this;
                    this.errorMsg = 'Loading';
                    if (this.displayload1) {
                        (new Promise(function (Resolve, Reject) {
                            global.loadImageFromPc(self.files, self.images, self.inputName, self.inputDescription, Resolve, Reject);
                        })).then(function (res) {
                            self.errorMsg = 'Loading ' + res;
                        }, function (err) {
                            self.errorMsg = 'Loading failed: ' + err;
                        });
                    } else {
                        (new Promise(function (Resolve, Reject) {
                            global.loadImageViaUrl(self.inputUrl, self.images, self.inputName, self.inputDescription, Resolve, Reject);
                        })).then(function (res) {
                            self.errorMsg = 'Loading ' + res;
                        }, function (err) {
                            self.errorMsg = 'Loading failed: ' + err;
                        });
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
                },
                'clearOriginalForm': function () {
                    this.$broadcast('clickOnPreview', {
                        item_id: '',
                        name: '',
                        description: '',
                        type: '',
                        urlOriginal: '',
                        urlPreview: ''
                    });
                    this.description = '';
                }
            },
            components: {
                'imagePreview': {
                    template: '<img v-bind:src="urlPreview" v-on:click="loadOriginal" :style="MyStyle">',
                    props: ['urlPreview', 'MyStyle'],
                    ready: function () {
                        this.MyStyle = {
                            border: "5px solid #dcdcdc"
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
                                    border: "5px solid #dcdcdc"
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
                                this.$dispatch('clickOnPreviewCheckBox', this.checkBoxId, this.checkBox);
                            }
                        }
                    }
                }
            }
        });
    }, function (err) {
    });
});
