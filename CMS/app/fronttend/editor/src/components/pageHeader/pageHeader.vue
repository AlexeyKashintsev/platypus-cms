<template>
    <div id="page-header">
      <button>Page editor</button>
      <button>Widget editor</button>
      <button>Resource gallery</button>

    </div>
</template>
<style lang="scss">
  #page-header{
    width: 900px;
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
    z-index:2;
    text-align: center;
    vertical-align: middle;
    button{
      width: 100%;
      height: 50px;
      background: #DDDDDD;
    }
  }
</style>
<script>
    export default{
        data(){
            return{
                msg:'hello vue'
            }
        },
    }
</script>
