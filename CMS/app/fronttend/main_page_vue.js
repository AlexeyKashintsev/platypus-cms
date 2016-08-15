require(['environment', 'id', 'resource', 'rpc'], function (F, id, Resource, Rpc) {
    var global = this;
    var Server;
    var page_list;
    var widget_list;

    global.parseMetaInfo = function (data, callback, error) {
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
            console.log('Loading ... First page');
            Server.getMeta(page_list[0].page_id, function (data) {
                global.parseMetaInfo(data, function (meta) {
                    Server.getWidgetInfo(widget_list[0].widget_id, function (widget) {
                        Server.getWidgetData(widget_list[0].widget_id, function (data_inf) {
                            pageModel.push({
                                page_inf: page_list[0],
                                meta_inf: meta
                            });
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
                            res('First page - Loaded');
                        });

                    });
                });
            });
        });
        pages_loaded.then(function (res) {
            console.log(res);
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
                        },
                        methods: {
                            reloadPage: function () {
                                console.log(this.widget_data);
                                //this.$dispatch('reloadPage');
                            }
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
                                        console.log(name);
                                        break;
                                    case 'Widget editor':
                                        this.showBar = true;
                                        this.page_list = false;
                                        this.widget_list = true;
                                        console.log(name);
                                        break;
                                    case 'Resource gallery':
                                        this.showBar = false;
                                        this.page_list = false;
                                        this.widget_list = false;
                                        console.log(name);
                                        break;
                                }
                            },
                        }
                    }
                },
                methods: {
                    selectPage: function (page_id) {
                        var self = this;
                        var cur_id = this.currentPage.page_inf.page_id;
                        for (var i = 0; i < this.pageModel.length; i++) {
                            (function (s, cur_Id, page_Id) {
                                if (self.pageModel[s].page_inf.page_id === page_Id) {
                                    if (page_Id !== cur_Id) {
                                        Server.getPageInfo(cur_Id, function (page_inf) {
                                            self.currentPage.page_inf = page_inf[0];
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
                                        });
                                    }
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
                    savePage: function () {
                        var self = this;
                        for (var i = 0; i < this.pageModel.length; i++) {
                            (function (s, page_Id) {
                                if (self.pageModel[s].page_inf.page_id === page_Id) {
                                    Server.changePageInfo(self.pageModel[s].page_inf, function (Text) {
                                        console.log(Text);
                                    }, function (err) {
                                        console.log(err);
                                    });
                                }
                            }(i, this.currentPage.page_inf.page_id));
                        }
                    },
                    viewChanged: function (name) {
                        this.$broadcast('changeSideBar', name);
                    },
                    createPage: function () {
                        var self = this;
                        console.log('1');
                        var Id = id.generate();
                        Server.addPageToDB({
                            page_id: Id,
                            name: '1',
                            author: '',
                            url: '',
                            template_id: '',
                            language_id: ''
                        }, function (Text) {
                            console.log(Text);
                            self.pageModel.push({
                                page_inf: {
                                    page_id: Id,
                                    name: '1',
                                    author: '',
                                    url: '',
                                    template_id: '',
                                    language_id: ''
                                }
                            });
                            console.log(self.pageModel);
                        }, function (err) {
                            console.log(err);
                        });
                    },
                    createWidget: function () {
                        console.log('2');
                    },
                    deletePage: function (item) {
                        var self = this;
                        Server.deletePage(item.page_inf.page_id, function (Text) {
                            self.pageModel.splice(self.pageModel.indexOf(item), 1);
                            console.log(Text);
                        }, function (err) {
                            console.log(err);
                        });
                    },
                    deleteWidget: function (item) {
                        var self = this;
                        Server.deleteWidget(item.widget_inf.widget_id, function (Text) {
                            self.widgetModel.splice(self.widgetModel.indexOf(item), 1);
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