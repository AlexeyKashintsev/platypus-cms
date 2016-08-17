require(['environment', 'id', 'resource', 'rpc'], function (F, id, Resource, Rpc) {
    var global = this;
    var Server;
    var page_list;
    var widget_list;

    global.parseMetaInfo = function (data, callback, error) {
        data[0].meta_inf = data[0].meta_inf.replace(/\n/g, '');
        data[0].meta_inf = data[0].meta_inf.replace(/\t/g, '');
        var MetaInfo = {};
        var regExp_query, regExp_query1;
        regExp_query = /<title>(.*)<\/title>/;
        MetaInfo.title = data[0].meta_inf.match(regExp_query)[1];
        regExp_query = /<meta charset=\"(.*)\">/;
        MetaInfo.charset = data[0].meta_inf.match(regExp_query)[1];
        regExp_query = /<meta name=\"(.*)\" \/>/ig;
        var meta = data[0].meta_inf.match(regExp_query)[0].split('>');
        for (var i = 0; i < meta.length - 1; i++) {
            regExp_query = /<meta name=\"(.*)\" content/;
            regExp_query1 = /content=\"(.*)\"/;
            if (meta[i].match(regExp_query)[1] !== 'keywords') {
                MetaInfo[meta[i].match(regExp_query)[1]] = meta[i].match(regExp_query1)[1];
            } else {
                var keywords = meta[i].match(regExp_query1)[1];
                MetaInfo.keywords = keywords.split(',');
            }
        }
        callback(MetaInfo);
    };

    global.unparseMetaInfo = function (MetaInfo, callback, error) {
        var meta = '';
        meta = meta + '\t<title>' + MetaInfo.title + '</title>\n';
        meta = meta + '\t<meta charset=\"' + MetaInfo.charset + '\">\n';
        meta = meta + '\t<meta name="description" content=\"' + MetaInfo.description + '\" />\n';
        var keywords = '';
        MetaInfo.keywords.forEach(function (word) {
            keywords = keywords + word + ',';
        });
        keywords = keywords.slice(0, -1);
        meta = meta + '\t\<meta name="keywords" content=\"' + keywords + '\" />\n';
        meta = meta + '\t\<meta name="author" content=\"' + MetaInfo.author + '\" />\n';
        callback(meta);
    };

    var promise = new Promise(function (Resolve, Reject) {
        Rpc.requireRemotes('Page_server', function (serv) {
            Server = serv;
            Server.getPageList(function (p_list) {
                Server.getWidgetsList(function (w_list) {
                    widget_list = w_list;
                    page_list = p_list;
                    Resolve('Success');
                }, function (err) {
                    Reject(err);
                });
            }, function (err) {
                Reject(err);
            });
        });
    });
    promise.then(function (res) {
        F.cacheBust(true);
        var pageModel = [];
        var widgetModel = [];
        var views = [];
        views.push({name: 'Page editor', component: 'pageEditor'},
                {name: 'Widget editor', component: 'widgetEditor'},
                {name: 'Resource gallery', component: 'resourceGallery'});
//        pageModel.push({
//            author: '',
//            page_id: '',
//            page_name: '',
//            url: '',
//            template_id: ''
//        });
        var pages_loaded = new Promise(function (res, err) {
            var ld = new Date();
            console.info(ld.toLocaleDateString() + ' ' + ld.toLocaleTimeString() + ' INFO\t' + 'Loading ... First page');
            Server.getMeta(page_list[0].page_id, function (data) {
                Server.getWidgetInfo(widget_list[0].widget_id, function (widget) {
                    Server.getWidgetData(widget_list[0].widget_id, function (data_inf) {
                        if (data.length) {
                            global.parseMetaInfo(data, function (meta) {
                                pageModel.push({
                                    page_inf: page_list[0],
                                    meta_inf: meta
                                });
                            });
                        } else {
                            pageModel.push({
                                page_inf: page_list[0],
                                meta_inf: {
                                    title: '',
                                    charset: '',
                                    author: '',
                                    description: '',
                                    keywords: ''
                                }
                            });
                        }
                        widgetModel.push({
                            widget_inf: widget[0],
                            widget_data: data_inf
                        });
                        for (var i = 1; i < widget_list.length; i++) {
                            widgetModel.push({
                                widget_inf: widget_list[i]
                            });
                        }
                        for (var i = 1; i < page_list.length; i++) {
                            pageModel.push({
                                page_inf: page_list[i]
                            });
                        }
                        var ld = new Date();
                        res(ld.toLocaleDateString() + ' ' + ld.toLocaleTimeString() + ' INFO\t' + 'First page - Loaded');
                    });

                });
            });
        });
        pages_loaded.then(function (res) {
            console.info(res);
            new Vue({
                el: 'body',
                data: {
                    pageModel: pageModel,
                    widgetModel: widgetModel,
                    currentPage: pageModel[0],
                    currentView: views[0],
                    currentWidget: widgetModel[0]
                },
                components: {
                    'pageHeader': {
                        template: '#page-header-template',
                        data: function () {
                            return{
                                views: views
                            };
                        },
                        props: {
                            currentView: Object
                        },
                        methods: {
                            viewSelected: function (view) {
                                if (this.currentView.name !== view.name) {
                                    this.currentView = this.views[this.views.indexOf(view)];
                                    this.$dispatch('viewChanged', view.name);
                                }
                            }
                        }
                    },
                    'pageEditor': {
                        template: '#page-editor-template',
                        data: function () {
                            return {
                                currentPage: pageModel[0],
                            };
                        },
                        props: {
                            addingKeyword: {
                                type: String,
                                default: function () {
                                    return '';
                                }
                            }
                        },
                        events: {
                            itemSelected: function (page) {
                                this.$set('currentPage', page);
                            }
                        },
                        methods: {
                            deleteKeyword: function (keyword) {
                                this.currentPage.meta_inf.keywords.$remove(keyword);
                            },
                            addKeyword: function (keyword) {
                                if (this.currentPage.meta_inf.keywords.indexOf(keyword) === -1) {
                                    this.currentPage.meta_inf.keywords.unshift(keyword);
                                    this.addingKeyword = '';
                                }
                            },
                            reloadPage: function () {
                                this.$dispatch('reloadPage');
                            },
                            savePage: function () {
                                this.$dispatch('savePage');
                            },
                            createPage: function () {
                                Server.createPage(this.currentPage.page_inf.page_id, function (res) {
                                    console.log(res);
                                }, function (err) {
                                    console.log(err);
                                });
                            }
                            //this
                        }
                    },
                    'widgetEditor': {
                        template: '#widget-editor-template',
                        data: function () {
                            return {
                                currentWidget: widgetModel[0],
                            };
                        },
                        props: {
                            widget_data: {
                                type: Array,
                                default: function () {
                                    return widgetModel[0].widget_data;
                                }
                            },
                            addingData: {
                                type: String,
                                default: function () {
                                    return '';
                                }
                            }
                        },
                        methods: {
                            reloadWidget: function () {
                                this.$dispatch('reloadWidget');
                            },
                            saveWidget: function () {
                                this.$dispatch('saveWidget');
                            },
                            deleteDataField: function (item) {
                                this.currentWidget.widget_data.$remove(item);
                            },
                            addDataField: function (item) {
                                if (this.currentWidget.widget_data.indexOf(item) === -1) {
                                    this.currentWidget.widget_data.unshift({
                                        widget_data_id: id.generate(),
                                        data_name: item,
                                        data_value: ''
                                    });
                                    this.currentWidget.widget_data[0].data_name = item;
                                    this.addingData = '';
                                }
                            },
                        },
                        events: {
                            widgetSelected: function (widget) {
                                this.$set('currentWidget', widget);
                            },
                            dataLoaded: function (data) {
                                this.widget_data = data;
                            }
                        }
                    },
                    'sideBar': {
                        template: '#side-bar-template',
                        data: function () {
                            return {
                                showBar: true,
                                page_list: true,
                                widget_list: false
                            };
                        },
                        props: {
                            show: Boolean,
                            page_items: {
                                type: Array,
                                default: function () {
                                    return pageModel;
                                }
                            },
                            widget_items: {
                                type: Array,
                                default: function () {
                                    return widgetModel;
                                }
                            },
                            iconToggle: String
                        },
                        methods: {
                            pageSelected: function (name) {
                                this.$dispatch('pageSelected', name);
                            },
                            widgetSelected: function (name) {
                                this.$dispatch('widgetSelected', name);
                            },
                            createPage: function () {
                                if (confirm('Создать страницу?'))
                                    this.$dispatch('createPage');
                            },
                            createWidget: function () {
                                if (confirm('Создать виджет?'))
                                    this.$dispatch('createWidget');
                            },
                            deletePage: function (item) {
                                if (confirm('Удалить страницу: ' + item.page_inf.page_name))
                                {
                                    this.$dispatch('deletePage', item);
                                }
                            },
                            deleteWidget: function (item) {
                                if (confirm('Удалить виджет: ' + item.widget_inf.name))
                                {
                                    this.$dispatch('deleteWidget', item);
                                }
                            }
                        },
                        watch: {
                            'show': function (val, oldVal) {
                                if (val)
                                    this.iconToggle = 'hide';
                                else
                                    this.iconToggle = 'show';
                            }
                        },
                        events: {
                            changeSideBar: function (name) {
                                switch (name) {
                                    case 'Page editor':
                                        this.showBar = true;
                                        this.page_list = true;
                                        this.widget_list = false;
                                        break;
                                    case 'Widget editor':
                                        this.showBar = true;
                                        this.page_list = false;
                                        this.widget_list = true;
                                        break;
                                    case 'Resource gallery':
                                        this.showBar = false;
                                        this.page_list = false;
                                        this.widget_list = false;
                                        break;
                                }
                            },
                        }
                    }
                },
                methods: {
                    selectPage: function (page_id, callback) {
                        var self = this;
                        if (!callback) {
                            callback = function () {
                                return true;
                            };
                        }
                        var cur_id = this.currentPage.page_inf.page_id;
                        for (var i = 0; i < this.pageModel.length; i++) {
                            (function (s, cur_Id, page_Id) {
                                if (page_Id !== cur_Id) {
                                    if (self.pageModel[s].page_inf.page_id === cur_id) {
                                        Server.getPageInfo(cur_Id, function (page_inf) {
                                            self.pageModel[s].page_inf = page_inf[0];
                                        });
                                    }
                                }
                                if (self.pageModel[s].page_inf.page_id === page_Id) {
                                    Server.getPageInfo(page_Id, function (page_inf) {
                                        Server.getMeta(page_Id, function (data) {
                                            if (data.length) {
                                                global.parseMetaInfo(data, function (meta) {
                                                    self.pageModel[s].page_inf = page_inf[0];
                                                    self.pageModel[s].meta_inf = meta;
                                                    self.$set('pageModel[s].meta_inf', meta);
                                                    self.$set('currentPage', self.pageModel[s]);
                                                    self.$broadcast('itemSelected', self.currentPage);
                                                    callback();
                                                });
                                            } else {
                                                var meta = {
                                                    title: '',
                                                    charset: '',
                                                    author: '',
                                                    description: '',
                                                    keywords: []
                                                };
                                                self.pageModel[s].page_inf = page_inf[0];
                                                self.pageModel[s].meta_inf = meta;
                                                self.$set('pageModel[s].meta_inf', meta);
                                                self.$set('currentPage', self.pageModel[s]);
                                                self.$broadcast('itemSelected', self.currentPage);
                                                callback();
                                            }
                                        }, function (err) {
                                            console.log(err);
                                        });
                                    }, function (err) {
                                        console.log(err);
                                    });
                                }
                            }(i, cur_id, page_id));
                        }
                    },
                    selectWidget: function (widget_id) {
                        var self = this;
                        var cur_id = this.currentWidget.widget_inf.widget_id;
                        for (var i = 0; i < this.widgetModel.length; i++) {
                            (function (s, cur_Id, widget_id) {
                                if (self.widgetModel[s].widget_inf.widget_id === widget_id) {
                                    if (widget_id !== cur_Id) {
                                        Server.getWidgetInfo(self.widgetModel[s].widget_inf.widget_id, function (w_inf) {
                                            Server.getWidgetData(self.widgetModel[s].widget_inf.widget_id, function (data) {
                                                self.widgetModel[s].widget_data = data;
                                                self.$broadcast('dataLoaded', data);
                                                self.widgetModel[s].widget_inf = w_inf[0];
                                                self.$set('currentWidget', self.widgetModel[s]);
                                                self.$broadcast('widgetSelected', self.widgetModel[s]);
                                            });
                                        });
                                    }
                                }
                            }(i, cur_id, widget_id));
                        }
                    }
                },
                events: {
                    pageSelected: function (page_id) {
                        this.selectPage(page_id);
                    },
                    widgetSelected: function (widget_id) {
                        this.selectWidget(widget_id);
                    },
                    reloadPage: function () {
                        var self = this;
                        for (var i = 0; i < this.pageModel.length; i++) {
                            (function (s, page_Id) {
                                if (self.pageModel[s].page_inf.page_id === page_Id) {
                                    Server.getPageInfo(page_Id, function (page_inf) {
                                        Server.getMeta(page_Id, function (data) {
                                            global.parseMetaInfo(data, function (meta) {
                                                self.pageModel[s].page_inf = page_inf[0];
                                                self.pageModel[s].meta_inf = meta;
                                                self.$set('currentPage', self.pageModel[s]);
                                                self.$broadcast('itemSelected', self.currentPage);
                                            });
                                        });
                                    }, function (err) {
                                        console.log(err);
                                    });
                                }
                            }(i, this.currentPage.page_inf.page_id));
                        }
                    },
                    reloadWidget: function () {
                        var self = this;
                        for (var i = 0; i < this.widgetModel.length; i++) {
                            (function (s, widget_id) {
                                if (self.widgetModel[s].widget_inf.widget_id === widget_id) {
                                    Server.getWidgetInfo(self.widgetModel[s].widget_inf.widget_id, function (w_inf) {
                                        Server.getWidgetData(self.widgetModel[s].widget_inf.widget_id, function (data) {
                                            self.widgetModel[s].widget_data = data;
                                            self.$broadcast('dataLoaded', data);
                                            self.widgetModel[s].widget_inf = w_inf[0];
                                            self.$set('currentWidget', self.widgetModel[s]);
                                            self.$broadcast('widgetSelected', self.widgetModel[s]);
                                        });
                                    });
                                }
                            }(i, this.currentWidget.widget_inf.widget_id));
                        }
                    },
                    savePage: function () {
                        var self = this;
                        for (var i = 0; i < this.pageModel.length; i++) {
                            (function (s, page_Id) {
                                if (self.pageModel[s].page_inf.page_id === page_Id) {
                                    Server.changePageInfo(self.pageModel[s].page_inf, function () {
                                        global.unparseMetaInfo(self.pageModel[s].meta_inf, function (meta) {
                                            Server.changePageMetaInfo(page_Id, meta, function (res) {
                                                console.log(res);
                                            }, function (err) {
                                                console.log(err);
                                            });
                                        });
                                    }, function (err) {
                                        console.log(err);
                                    });
                                }
                            }(i, this.currentPage.page_inf.page_id));
                        }
                    },
                    saveWidget: function () {
                        var self = this;
                        for (var i = 0; i < this.widgetModel.length; i++) {
                            (function (s, widget_Id) {
                                if (self.widgetModel[s].widget_inf.widget_id === widget_Id) {
                                    Server.changeWidgetInfo({
                                        widget_id: widget_Id,
                                        name: self.widgetModel[s].widget_inf.name,
                                        author: 'ya',
                                        description: '123',
                                        layout: self.currentWidget.widget_inf.layout
                                    }, function () {
                                        Server.changeWidgetData(widget_Id, self.currentWidget.widget_data, function (Text) {
                                            console.log(Text);
                                        }, function (err) {
                                            console.log(err);
                                        });
                                    }, function (err) {
                                        console.log(err);
                                    })
                                }
                            }(i, this.currentWidget.widget_inf.widget_id));
                        }
                    },
                    viewChanged: function (name) {
                        this.$broadcast('changeSideBar', name);
                    },
                    createPage: function () {
                        var self = this;
                        var Id = id.generate();
                        Server.addPageToDb({
                            page_id: Id,
                            page_name: '1',
                            author: ''
                        }, function (Text) {
                            console.log(Text);
                            self.pageModel.push({
                                page_inf: {
                                    page_id: Id,
                                    page_name: '1',
                                    author: '',
                                    url: '',
                                    template_id: '',
                                    language_id: ''
                                }
                            });
                        }, function (err) {
                            console.log(err);
                        });
                    },
                    createWidget: function () {
                        var self = this;
                        var Id = id.generate();
                        Server.addWidgetToDb({
                            widget_id: Id,
                            name: '1',
                            author: ''
                        }, function (Text) {
                            console.log(Text);
                            self.widgetModel.push({
                                widget_inf: {
                                    widget_id: Id,
                                    name: '1',
                                    author: ''
                                }
                            });
                        }, function (err) {
                            console.log(err);
                        });
                    },
                    deletePage: function (item) {
                        var self = this;
                        var index = self.pageModel.indexOf(item);
                        if (item.page_inf.page_id === self.currentPage.page_inf.page_id) {
                            if (index === self.pageModel.length - 1) {
                                self.selectPage(self.pageModel[index - 1].page_inf.page_id, function () {
                                    Server.deletePage(item.page_inf.page_id, function (Text) {
                                        self.pageModel.splice(index, 1);
                                    }, function (err) {
                                        console.log(err);
                                    });
                                    self.pageModel.splice(index, 1);
                                });
                            } else {
                                self.selectPage(self.pageModel[index + 1].page_inf.page_id, function () {
                                    Server.deletePage(item.page_inf.page_id, function (Text) {
                                        self.pageModel.splice(index, 1);
                                    }, function (err) {
                                        console.log(err);
                                    });
                                    self.pageModel.splice(index, 1);
                                });
                            }
                        } else {
                            self.pageModel.splice(index, 1);
                        }
                    },
                    deleteWidget: function (item) {
                        var self = this;
                        Server.deleteWidget(item.widget_inf.widget_id, function (Text) {
                            var index = self.widgetModel.indexOf(item);
                            if (item.widget_inf.widget_id === self.currentWidget.widget_inf.widget_id) {
                                if (index === self.widgetModel.length - 1) {
                                    self.selectWidget(self.widgetModel[index - 1].widget_inf.widget_id, function () {
                                        self.widgetModel.splice(index, 1);
                                    });
                                } else {
                                    self.selectWidget(self.widgetModel[index + 1].widget_inf.widget_id, function () {
                                        self.widgetModel.splice(index, 1);
                                    });
                                }
                            } else {
                                self.widgetModel.splice(index, 1);
                            }
                            self.widgetModel.splice(index, 1);
                            console.log(Text);
                        }, function (err) {
                            console.log(err);
                        });
                    }
                }
            });
        }, function (err) {
            console.log(err);
        });
    }, function (err) {
        console.log(err);
    });
});