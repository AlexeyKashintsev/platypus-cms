/**
 * Created by kevrat on 09.08.2016.
 */

window.onload = function () {

    var pageModel=[];
    pageModel.push({
        pageName:'page 0',
        pageURL:'',
        meta:{
            author:'',
            title:'',
            charset:'',
            description:'',
            keywords:[],
        },
        template:''
    });
    pageModel.push({
        pageName:'page 1',
        pageURL:'',
        meta:{
            author:'',
            title:'',
            charset:'',
            description:'',
            keywords:[],
        },
        template:''
    });

    new Vue({
        el: 'body',
        data:{
            pageModel:pageModel,
            currentPage:pageModel[0]
        },
        components: {
            'pageHeader':{
                template:'#page-header-template'
            },
            'pageEditor':{
                template:'#page-editor-template',
                data: function (){
                    return {
                        currentPage:''
                    }
                },
                events:{
                    itemSelected:function(page){
                        this.$set('currentPage',page);
                    }
                }
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
                        type: Object,
                        default: function () {
                            var items = [];
                            var i;
                            for(i=0;i<30;i++){
                                items.push({name:'page '+i});
                            }
                            return items;

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
                    if(this.pageModel[i].pageName+'' === pageName+''){
                        this.$set('currentPage',this.pageModel[i]);
                        this.$broadcast('itemSelected',this.currentPage);
                        return;
                    }
                };
                this.$set('currentPage',this.getPage(pageName));

            },
            getPage: function(pageName){
                return this.currentPage;
            }
        },
        events:{
            itemSelected:function(pageName){
                this.selectPage(pageName);
            }
        },
    })
}
