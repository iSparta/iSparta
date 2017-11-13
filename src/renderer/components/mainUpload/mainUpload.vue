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
        console.log(this.muFileList)
        if(!this.muFileList){return false;}
        fsOperate.readerFiles(this.muFileList).then((ars) => {
          var Obj = {}
          for (var i in ars) {
            Obj.basic = ars[i].basic
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
