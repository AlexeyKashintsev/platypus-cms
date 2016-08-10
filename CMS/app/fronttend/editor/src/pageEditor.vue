<template>
  <div id="page-editor">
    <div  id="pageForm">

      <form>
        <ul>
          <li>
            <label for="pageName">Page name</label>
            <input type="text" id="pageName" v-model="currentPage.pageName" required >
          </li>
          <li>
            <label for="pageURL">Page URL</label>
            <input type="text" id="pageURL" required >
          </li>
          <li>
          <label>Meta</label>
          <li>
            <label for="author">Author</label>
            <input type="text" id="author" >
          </li>
          <li>
            <label for="title">Title</label>
            <input type="text" id="title" >
          </li>
          <li>
            <label for="charset">Charset</label>
            <input type="text" id="charset" >
          </li>
          <li>
            <label for="description">Description</label>
            <textarea  id="description" ></textarea>
          </li>
          </li>
        </ul>
      </form>
    </div>
  </div>
</template>

<script>

//var model={
//  pageName:'',
//  URL:'',
//  meta:{
//    author:'',
//    title:'',
//    charset:'',
//    description:'',
//    keywords:[],
//  },
//  template:''
//};

export default {
  data: function (){
    return {
      currentPage:''
    }
  },
//  props:{
//    currentPage:Number,
//  },
  events:{
    itemSelected:function(page){
      this.$set('currentPage',page);
    }
  }
}
</script>

<style lang="scss">
  $width: 600px;
  $height:800px;
  *:focus {outline: none;}

  #page-editor{
    #pageForm{
      width: 900px;
      margin: auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
      z-index:2;
      text-align: center;
      vertical-align: middle;
      background:#b4b472;
      flex-wrap:nowrap ;

      ul {
        list-style-type:none;
        list-style-position:outside;
        margin:0px;
        padding:0px;
      }
      li{
        padding:12px;
        position:relative;
      }
      label {
        width:150px;
        margin-top: 3px;
        display: block;
        float:left;
        padding:3px;
      }
      input {
        display: block;
        height:20px;
        width:220px;
        padding:5px 8px;
      }
      textarea {padding:8px; width:300px;}
    }
  }

</style>
