<template>
    <div id="side-bar">
      <div id="side-bar-body">
        <div id="side-bar-header" v-show="show">
        </div>
        <div id="side-bar-content" v-show="show">
            <ul >
              <li v-for="item in items" @click="itemSelected(item.name)">
                {{ item.name }}
              </li>
            </ul>
        </div>
        <div id="side-bar-footer" v-show="show">
        </div>
      </div>

      <div id="side-bar-toggle" @click="show=!show">
        <span>
          {{iconToggle}}
        </span>
      </div>
    </div>
</template>

<style lang="scss">
  $side-bar-color: #2F4F4F;
  $side-bar-widtch:200px;
  $side-bar-height:800px;
  $side-bar-header-color: #DDDDDD;
  $side-bar-content-color: #383838;
  $side-bar-footer-color: $side-bar-header-color;
  $side-bar-toggle-color: #B7B7B7;
  $side-bar-scrollbar-color: #777777;

  @function make-grayer($value) {
    @return $value + #778899;
  }

  #side-bar{
    float: none;
    z-index: 100;
    position: static;
    display: inline-flex;
    /*flex-direction: row;*/
    width: $side-bar-widtch;
    height:$side-bar-height;

    #side-bar-body{
      text-align: center;
      display: flex;
      flex-direction: column;
      background:$side-bar-color;
      #side-bar-header{
        max-height: 50px;
        width: $side-bar-widtch;
        height: $side-bar-height*15/100;
        background: $side-bar-header-color;
      }
      #side-bar-content{
        width: $side-bar-widtch;
        min-height: 10px;
        height: 100%;
        background: $side-bar-content-color;

        ul{
          margin: 0;
          list-style-type: none;
          height: 100%;
          overflow-x: hidden;
          text-align: left;
          padding: 0px;
          li{
            position: relative;
            color: #DDDDDD;
            height: 40px;
            min-width: 50px;
            min-height: 30px;
            max-height: 50px;
            width: $side-bar-widtch;
            box-shadow:  inset 0px 2px 2px 0px rgba(0,0,0,0.5);
            cursor: pointer;
          }
          li:last-child{
            box-shadow: inset 0px 2px 2px 0px rgba(0,0,0,0.5),
                              0px 2px 2px 0px rgba(0,0,0,0.5);
          }
          li:hover{
            color: #778899;
            box-shadow:   0px 4px 2px 0px rgba(0,0,0,0.5),
            0px -4px 2px 0px rgba(0,0,0,0.5);
          }
        }
      }
      #side-bar-footer{
        max-height: 50px;
        min-height: 10px;
        width: $side-bar-widtch;
        height: $side-bar-height*15/100;
        background: $side-bar-footer-color;
      }

    }
    #side-bar-toggle{
      width: 10%;
      display: flex;
      text-align: center;
      vertical-align: middle;
      background: $side-bar-toggle-color;
      justify-content: center;
      flex-direction: column;
      cursor: pointer;
      span{
        transform: rotate(-90deg);
        color:black;

      }
    }
    #side-bar-toggle:hover{
      box-shadow: -5px 0px 5px -2px rgba(0,0,0,0.5);

    }
    ::-webkit-scrollbar{
      width: 1em;

    }

    ::-webkit-scrollbar-track {
      box-shadow:  0 0px 10px 0px rgba(0,0,0,0.5),
    }

    ::-webkit-scrollbar-thumb {
      background:  $side-bar-scrollbar-color;
      outline: 1px solid slategrey;
    }
  }

</style>

<script>
    export default{
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
</script>
