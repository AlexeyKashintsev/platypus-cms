/**
 * Created by kevrat on 20.07.2016.
 */
window.onload = function () {
    define('viewer', ['Server', 'rpc'], function (Server, Rpc) {
        var Server = new Rpc.Proxy('Server');
        new Vue({
            el: '#imageViewer',
            data: {
                currentImage: {},
                images: []
            },
            created: function () {
                var SmallImageDirectory;
                Server.getSmallImageDirectory(function (Data) {
                    SmallImageDirectory = Data;
                });
                var urls = this.getUrls();
                for (i = 0; i < urls.length; i++) {
                    this.images.push({
                        name: urls[i].name,
                        description: urls[i].description,
                        type: urls[i].type,
                        urlOriginal: urls[i].URL,
                        urlPreview: SmallImageDirectory + urls[i].name
                    });
                }
                ;
                this.currentImage = this.images[0];
            },
            methods: {
                getDb: function () {
                    var urls;
                    Server.getInfo(function (Data) {
                        urls = Data;
                    });
                    return urls;
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
                    template: '<img v-bind:src="urlPreview" v-on:click="loadOriginal">"{{urlPreview}}"',
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
                    template: '<img v-bind:src="urlOriginal">"{{urlOriginal}}"',
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
};