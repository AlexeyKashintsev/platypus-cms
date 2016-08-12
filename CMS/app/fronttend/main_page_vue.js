require(['environment', 'id', 'resource', 'rpc'], function (F, id, Resource, Rpc) {
    var global = this;
    var Server;
    var page_list;

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
            Server.getPageList(function (list) {
                page_list = list;
                Resolve('Success');
            });
        });
    });
    promise.then(function (res) {
        F.cacheBust(true);
        var pageModel = [];
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
                    console.log(meta);
                    pageModel.push({
                        page_inf: page_list[0],
                        meta_inf: meta
                    });
                    for (var i = 1; i < page_list.length; i++) {
                        pageModel.push({
                            page_inf: page_list[i]
                        });
                    }
                    res('First page - Loaded');
                });
            });
        });
        pages_loaded.then(function (res) {
            console.log(res);
            new Vue({
                el: 'body',
                data: {
                    pageModel: pageModel,
                    currentPage: pageModel[0],
                    currentView: views[0]
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
                        ready: function () {
                            console.log(this.currentPage);
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
                            s1: function () {
                                console.log(this.currentPage.meta_inf.author, this.currentPage.page_inf.page_name);
                            },
                            s2: function (a) {
                                console.log(a);
                            }
                        }
                    },
                    'widgetEditor': {
                        template: '#widget-editor-template'
                    },
                    'sideBar': {
                        template: '#side-bar-template',
                        data: function () {
                            return {
                            };
                        },
                        props: {
                            show: Boolean,
                            items: {
                                type: Array,
                                default: function () {
                                    return pageModel;
                                }
                            },
                            iconToggle: String
                        },
                        methods: {
                            itemSelected: function (name) {
                                this.$dispatch('itemSelected', name);

                            }
                        },
                        watch: {
                            'show': function (val, oldVal) {
                                if (val)
                                    this.iconToggle = 'hide';
                                else
                                    this.iconToggle = 'show';
                            }
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
                                        });
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
                                }
                            }(i, cur_id, page_id));
                        }
                    }
                },
                events: {
                    itemSelected: function (pageName) {
                        this.selectPage(pageName);
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