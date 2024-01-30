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
      <div class="el-upload__text">{{ $t("uploadTips") }}</div>
      <div class="el-upload__tip" slot="tip">{{ $t("uploadRule") }}</div>
    </el-upload>
    </div>
  </section>
</template>
<script>

import { f as fsOperate } from '../drag/file.js'
import * as d from '../drag/drag.js'

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
    beforeUpload () {
      return false
    },
    handle () {
      return false
    },
    upFile (filsList) {
      dialog.showOpenDialog({ properties: [ 'openFile', 'openDirectory', 'multiSelections' ]}, (res) => {
        this.muFileList = res
        if(!this.muFileList){return false;}
        fsOperate.readerFiles(this.muFileList).then((ars) => {
          var Obj = {}
          for (var i in ars) {
            // Note: 此处读取文件后排序有问题，如 xx_2 会排到 xx_10 之前导致导出帧不正确，因此手动排序一次
            // 图省事儿，复制粘贴瞎命名了，不代表真实水平
            ars[i].basic.fileList.sort((a, b) => {
              const _a = a.replace(/(\d+)/g, (e) => {
                  let _e = e;
                  if (e.length < 8) {
                      let len = e.length;
                      let add = 8 - len;
                      let z = '';
                      for (let i = 0; i < add; i++) {
                          z+='0'
                      }
                      _e=z+_e
                  }
                  return _e
              })
              const _b = b.replace(/(\d+)/g, (e) => {
                  let _e = e;
                  if (e.length < 8) {
                      let len = e.length;
                      let add = 8 - len;
                      let z = '';
                      for (let i = 0; i < add; i++) {
                          z+='0'
                      }
                      _e=z+_e
                  }
                  return _e
              })
              return _a > _b ? 1 : -1;
            });
            // Obj.basic = Object.assign({}, ...ars[i].basic, {filsList})
            Obj.basic = ars[i].basic;
            Obj.options = ars[i].options
            this.$store.dispatch('add', Obj)
          }
        })
      })
      return false
    }
  },
  mounted () {
  }
}
</script>

<style lang="scss">
@import "./mainUpload";
</style>
