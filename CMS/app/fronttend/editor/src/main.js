import Vue from 'vue'
import pageHeader from './components/pageHeader/pageHeader.vue'
import sideBar from './components/sideBar/sideBar.vue'
import pageEditor from './pageEditor'

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
/* eslint-disable no-new */
new Vue({
  el: 'body',
  data:{
    pageModel,
    currentPage:pageModel[0]
  },
  components: { pageEditor,pageHeader,sideBar },

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
    getPage(pageName){
      return this.currentPage;
    }
  },
  events:{
    itemSelected:function(pageName){
      this.selectPage(pageName);
    }
  },
})
