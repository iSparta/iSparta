<template>
  <section class="mod-upload" v-if="items.length == 0" >
    <div class="upload-wrap" v-on:click="upFile">
    <el-upload
      class="upload-content"
      drag 
      action="javascript:void(0)" 
      :before-upload="beforeUpload"
      disabled 
      multiple 
     >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击打开</em></div>
      <div class="el-upload__tip" slot="tip">
        只能上传
        <el-tooltip class="item" effect="dark" content="Top Center 提示文字" placement="top">
          <el-button type="text">PNG序列</el-button>
        </el-tooltip>
        、APNG、webP、GIF这四种图片格式</div>
    </el-upload>
    </div>
  </section>
</template>
<script>

import { f as fsOperate } from '../drag/file.js'
import * as d from '../drag/drag.js';

const {dialog} = require('electron').remote

export default {
  data () {
    return {
      imageUrl: '',
      muFileList: []
    }
  },
  computed: {
    items: function () {
      return this.$store.getters.getterItems
    }
  },
  methods: {
    beforeUpload(){
      return false;
    },
    handle () {
      return false;
    },
    upFile(filsList){

      dialog.showOpenDialog({ properties: [ 'openFile', 'openDirectory', 'multiSelections' ]},(res)=>{
            this.muFileList = res;
            console.log(this.muFileList);
            fsOperate.readerFiles(this.muFileList).then((ars) => {
              var Obj = {}
              for (var i in ars) {
                Obj.basic = ars[i].basic
                Obj.options = ars[i].options
                this.$store.dispatch('add', Obj)
              }
            })
      });
      return false;
    }
  },
  mounted () {
  }
}
</script>

<style lang="scss">
@import "./mainUpload";
</style>
