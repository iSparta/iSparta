<template>
<section class="mod-setting" v-if="curtSetting">
  <h3 class="ui-border-t">{{ $t("outputConfig") }}</h3>
  <section class="mod-multi" v-if="curtSetting.length">
    <p>{{ $t("multiText") }}</p>
    <el-button type="primary" v-on:click="start('')" :disabled="isStarted">&ensp;{{ $t("batchStart") }}&ensp;</el-button>
    <el-button type="primary" v-on:click="changeOutput" :disabled="isStarted">{{ $t("outputTofolder") }}</el-button>
  </section>
  <section class="mod-form" v-else>
    <div class="ui-border-b" v-if="showFrame">
      <el-form label-width="">
        <el-form-item :label="$t('fps')">
          <el-input v-model.number="frameRate" type="number" max="100" min="0" size="mini"  placeholder="24"></el-input>
        </el-form-item>
        <el-form-item :label="$t('loop')">
          <el-input v-model.number="loop" type="number" size="mini" placeholder="0"></el-input>{{ $t('times') }}
          <i>({{ $t('loopTips') }})</i>
        </el-form-item>
      </el-form>
    </div>
    <div class="ui-border-b mod-output">
      <el-form label-width="">
        <el-form-item  :label="$t('outputName')" class="suffix">
          <el-input v-model="outputName" size="mini" placeholder="output-ispt"></el-input>
        </el-form-item>
        <p>{{ $t("outputFormat") }}</p>
        <el-checkbox-group v-model="formatList" :min="1">
          <el-checkbox v-for="format in formatStatic" :label="format" :key="format">{{format}}</el-checkbox>
        </el-checkbox-group>
      </el-form>
    </div>
    <div class="ui-border-b mod-quality">
      <p>{{ $t("compressionQuality") }}</p>
      <el-form :inline="true">
        <el-form-item class="mr-5">
          <el-checkbox v-model="qualityCheck">Quality</el-checkbox>
        </el-form-item> 
        <el-form-item>
          <el-input v-model.number="quality" type="number" size="mini" placeholder="100" @blur="qualityBlur"></el-input>
          <i>(0-100)</i>
        </el-form-item>
      </el-form>
    </div>
    <el-button type="primary" v-on:click="start('')" :disabled="isStarted">&emsp;{{ $t("start") }}&emsp;</el-button>
  </section>
  <section class="mod-toolbox">
    <i class="el-icon-delete" v-on:click="onDeleteAll()"></i>
  </section>
</section>
</template>
<script>
import processor from '../../util/processor'
const ipc = require('electron').ipcRenderer
export default {
  data () {
    return {
      // formatStatic: ['APNG', 'GIF', 'WEBP']
    }
  },
  created () {
    // 回应输出到目录的操作
    ipc.on('change-multiItem-fold', (event, path) => {
      // console.log(this.$store,path[0]);
      this.start(path[0])
      // processor().then(() => {})
    })
  },
  computed: {
    selectedList () {
      var selectedList = this.$store.getters.getterSelected
      return selectedList
    },
    curtSetting () {
      if (this.selectedList.length == 0) {
        return false
      } else if (this.selectedList.length == 1) {
        // 单选
        var selectedData = this.selectedList[0].options
        // console.log(selectedData);
        return selectedData
      } else {
        // 多选
        return this.selectedList
      }
    },
    isStarted () {
      var schedule = this.selectedList[0].process.schedule
      if (schedule > 0 && schedule < 1) {
        return true
      } else {
        return false
      }
    },
    showFrame () {
      if (this.selectedList[0].basic.type == 'PNGs') {
        return true
      } else {
        return false
      }
    },
    formatStatic () {
      if (this.selectedList[0].basic.type == 'GIF') {
        return ['APNG', 'WEBP']
      } else {
        return ['APNG', 'GIF', 'WEBP']
      }
    },
    frameRate: {
      get () {
        // console.warn(this.curtSetting.length)
        return this.curtSetting.frameRate
      },
      set (value) {
        this.$store.dispatch('editMultiOptions', {
          frameRate: value
        })
      }
    },
    loop: {
      get () {
        // console.warn(this.curtSetting.frameRate)
        return this.curtSetting.loop
      },
      set (value) {
        this.$store.dispatch('editMultiOptions', {
          loop: value
        })
      }
    },
    outputName: {
      get () {
        // console.warn(this.curtSetting.frameRate)
        return this.curtSetting.outputName
      },
      set (value) {
        this.$store.dispatch('editOptions', {
          outputName: value
        })
      }
    },
    formatList: {
      get () {
        // console.warn(this.curtSetting.outputFormat)
        return this.curtSetting.outputFormat
      },
      set (value) {
        this.$store.dispatch('editOptions', {
          outputFormat: value
        })
      }
    },
    qualityCheck: {
      get () {
        return this.curtSetting.quality.checked
      },
      set (value) {
        this.$store.dispatch('editMultiOptions', {
          quality: {
            'checked': value,
            'value': this.quality
          }
        })
      }
    },
    quality: {
      get () {
        // console.warn(this.curtSetting.frameRate)
        return this.curtSetting.quality.value
      },
      set (value) {
        if(value > 100 || value < 0){
          return false;
        }
        this.$store.dispatch('editMultiOptions', {
          quality: {
            'checked': this.qualityCheck,
            'value': value
          }
        })
      }
    }

  },
  methods: {
    floydBlur:function(self){
      self.srcElement.value = this.floyd;
    },
    qualityBlur:function(self){
      self.srcElement.value = this.quality;
    },
    changeOutput: function () {
      var outputPath = this.selectedList[0].basic.outputPath
      // console.log(outputPath)
      ipc.send('change-multiItem-fold', outputPath)
    },
    start: function (sameOutputPath) {
      // console.log(sameOutputPath)
      let locale = this.$i18n.messages[this.$i18n.locale]
      for (var i = 0; i < this.selectedList.length; i++) {
        this.$store.dispatch('editProcess', {
          index: i,
          text: '',
          schedule: 0
        })
      }
      setTimeout(() => {
        this.$store.dispatch('setLock', true)
        processor(this.$store, sameOutputPath,locale).then()
      }, 20)
    },
    onDeleteAll:function(){
      this.$store.dispatch('removeAll')
    }
  },
  watch: {

  }
}
</script>

<style lang="scss">
@import "./setting.scss";
</style>
