<template>
  <el-dialog :title="$t('delayTitle')" :visible="true"  :modal-append-to-body="true" :append-to-body="true" width="600px" :close-on-click-modal="false" @close="onClose" top="30px">
    <div class="frame-preview">
      <div class="preview">
        <img :src="'file://'+previewURL" />
      </div>
      <el-button type="primary" size="small" @click="onPreview">{{ $t('preview')}}</el-button>
      
    </div>
    <div class="frame-list" v-if="delayProject">
      <div class="frame" v-for="(item,index) in delayProject.basic.fileList"  :key="index">
        <img :src="'file://'+delayProject.basic.fileList[index]" />
        <el-input-number v-model="delays[index]" controls-position="right" size="mini" :step="0.01"></el-input-number>
        <!-- <el-input  size="mini"   v-model="delays[index]"></el-input> -->
      </div>
    </div>
    <div class="fps-setting">
        <div class="label">{{ $t('fps')}}</div><el-input v-model="rate" size="mini"></el-input><el-button @click="onResetRate" size="mini">{{ $t('apply')}}</el-button>
      </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onCancel">{{ $t('cancel')}}</el-button>
      <el-button type="primary" @click="onDelayConfirm">{{ $t('confrim')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
const path = require('path')
const fs = require('fs')
const _ = require('lodash')

// 读取图片类型
import typeData from '../../store/enum/type'
const imgType = _.values(typeData).join(',')

const ipc = require('electron').ipcRenderer
const {dialog} = require('electron').remote
import { f as fsOperate } from '../drag/file.js'
export default {
  props:{
    project:{
      type:Object,
      default:null
    }
  },
  data () {
    return {
      delayProject:null,
      delays:[],
      previewURL:"",
      timer:null,
      rate:0
    }
  },

  created () {
    // 与筛选组件通信
   
  },
  computed: {
    
  },
  mounted(){
    let project = JSON.parse(JSON.stringify(this.project));
    let delays=[];
    if(project.options.delays){
      delays=project.options.delays;
    }
    for(let i =0;i<project.basic.fileList.length;i++){
      if(!delays[i]){
        delays[i]=(1/project.options.frameRate).toFixed(3);
      }
    }
    
    this.delayProject=project;
    // this.delayProject.options.delays=delays;
    this.delays=delays;
    this.previewURL=this.delayProject.basic.fileList[0]
    this.rate = this.delayProject.options.frameRate;
  },
  methods: {
    
    
    onDelayConfirm(){
      let project = this.project;
      project.options.frameRate = this.delayProject.options.frameRate;
      project.options.delays=this.delays;
      this.$emit("close");
    },
    onCancel(){
      this.$emit("close");
    },
    onClose(){
      this.$emit("close");
    },
    async onPreview(){
      window.clearTimeout(this.timer);
      let fileList = this.delayProject.basic.fileList;
      this.previewURL=fileList[0]
      for(let i=0;i<fileList.length;i++){
        let url="";
        if(i==fileList.length-1){
          url=fileList[0];
        }else{
          url=fileList[i+1];
        }
        await this.showImage(url,this.delays[i]*1000)
      }
    },
    showImage(url,time){
      return new Promise( (resolve, reject)=>{
        this.timer = window.setTimeout(()=>{
          this.previewURL=url;
          resolve();
        },time)
      })
      
    },
    onResetRate(){
      this.delayProject.options.frameRate=this.rate;
      let delays=[];
      for(let i =0;i<this.delayProject.basic.fileList.length;i++){
        delays[i]=(1/this.rate).toFixed(3);
      }
      this.delays = delays;

    }
  }
}
</script>

<style lang="scss" src="./sass/index.scss">

</style>
