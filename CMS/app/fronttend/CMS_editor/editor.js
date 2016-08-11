/**
 * Created by kevrat on 09.08.2016.
 */

window.onload = function () {

    var pageModel=[];
    pageModel.push({
        name:'page 0',
        pageURL:'',
        meta:{
            author:'',
            title:'',
            charset:'',
            description:'',
            keywords:['test111111111','test2','test3','test4','test5','test6','test7','test','tes','12','234','4322','te334st8','dgdg','sdfs'],
        },
        template:''
    });
    pageModel.push({
        name:'page 1',
        pageURL:'',
        meta:{
            author:'',
            title:'',
            charset:'',
            description:'',
            keywords:['test9','test10','test11','test12','test13','test14','test15','test16'],
        },
        template:''
    });
    var views=[];
    views.push({name:'Page editor', component:'pageEditor'},
               {name:'Widget editor', component:'widgetEditor'},
               {name:'Resource gallery', component:'resourceGallery'});

    new Vue({
        el: 'body',
        data:{
            pageModel:pageModel,
            currentPage:pageModel[0],
            currentView:views[0]
        },
        components: {
            'pageHeader':{
                template:'#page-header-template',
                data:function(){
                    return{
                        views:views
                    }
                },
                props:{
                    currentView:Object
                },
                methods:{
                    viewSelected:function(view){
                        if(this.currentView.name !== view.name){
                            this.currentView=this.views[this.views.indexOf(view)];
                        }

                    }
                },
            },
            'pageEditor':{
                template:'#page-editor-template',
                data: function (){
                    return {
                        currentPage:pageModel[0],
                    }
                },
                props:{
                    addingKeyword:{
                        type:String,
                        default:function () {
                            return '';
                        }
                    }
                },
                events:{
                    itemSelected:function(page){
                        this.$set('currentPage',page);
                    }
                },
                methods:{
                    deleteKeyword:function(keyword){
                        this.currentPage.meta.keywords.$remove(keyword);
                    },
                    addKeyword:function (keyword) {
                        if(this.currentPage.meta.keywords.indexOf(keyword)===-1)
                            this.currentPage.meta.keywords.unshift(keyword);

                    }
                }
            },
            'widgetEditor':{
                template:'#widget-editor-template',

            },
            'sideBar':{
                template:'#side-bar-template',
                data: function (){
                    return {

                    }
                },
                props:{
                    show: Boolean,
                    items:{
                        type: Array,
                        default: function () {
                            // var items = [];
                            // var i;
                            // for(i=0;i<30;i++){
                            //     items.push({name:'page '+i});
                            // }
                            return pageModel;

                        }
                    },
                    iconToggle: String
                },
                methods:{
                    itemSelected:function(name){
                        this.$dispatch('itemSelected',name);

                    }
                },
                watch:{
                    'show': function (val, oldVal) {
                        if(val)
                            this.iconToggle='hide';
                        else
                            this.iconToggle='show';
                    },
                }
            }
        },

        methods:{
            selectPage:function (pageName){
                for(var i=0;i<this.pageModel.length;i++){
                    if(this.pageModel[i].name+'' === pageName+''){
                        this.$set('currentPage',this.pageModel[i]);
                        this.$broadcast('itemSelected',this.currentPage);
                        return;
                    }
                };
            }
        },
        events:{
            itemSelected:function(pageName){
                this.selectPage(pageName);
            }
        },
    })
}
