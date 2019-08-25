<template>
<section class="mod-list">
  <template v-for="(project,index) in projectList">
    <div class="item" @click.exact="!$event.metaKey && itemClick(project.basic,index)" @click.meta="multiSelect(index)" v-bind:class="{active:project.isSelected}" v-if="sortType.indexOf(project.basic.type) != -1" :data-index="index" :key="project.id" @contextmenu="itemRightClick(project.basic,index)">
      <div class="thumb">
        <img :src="'file://'+project.basic.fileList[0]" />
      </div>
      <div class="info">
        <div class="input">
          <el-tag :type="getLabel(project.basic.type)" size="mini">{{ project.basic.type }}</el-tag>
          <p class="inputPath" :title="'输入目录：'+project.basic.inputPath">{{ project.basic.inputPath | basePath }}</p>
          <i class="el-icon-setting" v-if="project.basic.type=='PNGs'" @click="onDelaySetting(project)"></i>
        </div>
        <div class="output">
          <i class="el-icon-edit"></i>
          <p class="outputPath" @click="changeFold(project.basic.outputPath,index)" :title="'输出目录：'+project.basic.outputPath">{{ project.basic.outputPath | basePath }}</p>
        </div>
      </div>
      <div class="status" :class="processStatus(project.process.schedule)" ><i class="el-icon-loading" v-if="project.process.schedule > 0 && project.process.schedule < 1"></i>{{ project.process.text }}</div>
      <div class="progress" :class="{fail:isFail(project.process.schedule)}" >
        <span class="precent" :class="{ani:isStarted(project.process.schedule)}" :style="{width: processPrecent(project.process.schedule) + '%' }"></span>
      </div>
    </div>
  </template>
  <dialay-dialog v-if="dialogFormVisible" :project="delayProject" @close="dialogFormVisible=false"></dialay-dialog>
  <div class="open-folder" v-on:click="openFolder">
    打开目录...
  </div>
</section>
</template>
<script>
const path = require('path')
const fs = require('fs')
const _ = require('lodash')
const rightMenu = require('./menu')

// 读取图片类型
import typeData from '../../store/enum/type'
const imgType = _.values(typeData).join(',')
// console.log(imgType)

const ipc = require('electron').ipcRenderer
const {dialog} = require('electron').remote
import DelayDialog from  '../delayDialog/index.vue'
import { f as fsOperate } from '../drag/file.js'
export default {
  components:{
    'dialay-dialog':DelayDialog
  },
  data () {
    return {
      // projectList: []
      sortType: imgType,
      dialogFormVisible:false,
      delayProject:null
    }
  },

  created () {
    // 与筛选组件通信
    this.$root.eventBus.$on('sortList', value => {
      // console.log(value)
      if (value == 'ALL') {
        this.sortType = imgType
      } else {
        this.sortType = value
      }
    })
    // 回应修改输出目录的操作
    ipc.on('change-item-fold', (event, path, order) => {
      
      if(path[0]){
        this.$store.dispatch('editBasic', {
          outputPath: path[0]
        })
      }
      
    })
    // 回应CTRL+A全选操作
    ipc.on('selectAll', () => {
      this.$store.dispatch('allSelect')
    })
    // 回应CTRL+Backspace删除操作
    ipc.on('delItem', () => {
      this.$store.dispatch('remove')
    })
  },
  computed: {
    selectedList () {
      var data = this.$store.getters.getterSelected
      return data
    },
    isMultiItems () {
      return this.selectedList.length > 1
    },
    selectedIndex () {
      var data = this.$store.getters.getterSelectedIndex
      return data
    },
    projectList () {
      var data = this.$store.getters.getterItems
      let hasSelected=false;
      for(let i=0;i<data.length;i++){
        if(data[i].isSelected){
          hasSelected=true;
          break;
        }
      }
      if(!hasSelected&&data[0]){
        data[0].isSelected=true;
      }
      return data
    },
    isLocked () {
      var data = this.$store.getters.getterLocked
      return data
    }
  },
  methods: {
    // 映射标签样式
    getLabel (label) {
      var labelMap = {
        'PNGs': 'primary',
        'APNG': 'success',
        'GIF': 'warning'
      }
      // console.log(label)
      return labelMap[label]
    },
    isStarted (schedule) {
      if (schedule > 0 && schedule < 1) {
        return true
      } else {
        return false
      }
    },
    processStatus (schedule) {
      if (schedule == 1) {
        return 'success'
      } else if (schedule == -1) {
        return 'fail'
      } else {
        return ''
      }
    },
    isFail (schedule) {
      if (schedule == -1) {
        return true
      } else {
        return false
      }
    },
    processPrecent (schedule) {
      // console.log(schedule);
      switch (schedule) {
        case -1:
          return 100
        default:
          return schedule * 100
      }
    },
    // 按下command多选
    multiSelect (index) {
      // console.log("multi")
      if (this.selectedList.length == 1 && this.selectedIndex == index) {
        // 过滤掉多选只有一项的情况
        return false
      }
      this.$store.dispatch('multiSelect', index)
    },
    itemClick (project, index) {
      // console.log("single")
      this.$store.dispatch('singleSelect', index)
    },
    itemRightClick (currentItem, index) {
      // console.log(rightMenu)
      var locale =this.$i18n.messages[this.$i18n.locale]
      // console.log(locale);
      this.$store.dispatch('setSelected', index)
      // console.log(this.isMultiItems)
      if (this.isMultiItems) {
        window.setTimeout(() => {
          rightMenu.default.init(this.$store, currentItem, index, true ,locale)
        }, 10)
      } else {
        window.setTimeout(() => {
          rightMenu.default.init(this.$store, currentItem, index, false ,locale)
        }, 10)
      }
    },
    changeFold (outputPath, index) {
      if (this.isLocked) {
        return false
      }
      ipc.send('change-item-fold', outputPath, index)
    },
    openFolder(){
      dialog.showOpenDialog({ properties: [ 'openFile', 'openDirectory', 'multiSelections' ]}, (res) => {
        this.muFileList = res
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
    },
    onDelaySetting(project){
      this.delayProject=project;
      this.dialogFormVisible=true; 
    }
  }
}
</script>

<style lang="scss">
@import "./projectList.scss";
</style>
