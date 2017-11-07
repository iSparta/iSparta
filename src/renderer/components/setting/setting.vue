<template>
<section class="mod-setting" v-if="curtSetting">
  <h3 class="ui-border-t">输出设置</h3>
  <section class="mod-multi" v-if="curtSetting.length">
    <p>目前为多选状态，使用各自的配置输出</p>
    <el-button type="primary" v-on:click="start('')" :disabled="isStarted">&ensp;批量开始&ensp;</el-button>
    <el-button type="primary" v-on:click="changeOutput" :disabled="isStarted">输出到目录</el-button>
  </section>
  <section class="mod-form" v-else>
    <div class="ui-border-b" v-if="showFrame">
      <el-form label-width="">
        <el-form-item label="帧频:">
          <el-input v-model.number="frameRate" type="number" max="100" min="0" size="mini" placeholder="24"></el-input>fps
        </el-form-item>
        <el-form-item label="循环:">
          <el-input v-model.number="loop" type="number" size="mini" placeholder="0"></el-input>次
          <i>(0次代表无限循环)</i>
        </el-form-item>
      </el-form>
    </div>
    <div class="ui-border-b mod-output">
      <el-form label-width="">
        <el-form-item label="输出名字:" class="suffix">
          <el-input v-model="outputName" size="mini" placeholder="output-ispt"></el-input>
        </el-form-item>
        <p>输出格式:</p>
        <el-checkbox-group v-model="formatList" :min="1">
          <el-checkbox v-for="format in formatStatic" :label="format" :key="format">{{format}}</el-checkbox>
        </el-checkbox-group>
      </el-form>
    </div>
    <div class="ui-border-b mod-quality">
      <p>压缩质量:</p>
      <el-form :inline="true">
        <el-form-item>
          <el-checkbox v-model="floydCheck">floyd&nbsp;&nbsp;&nbsp;</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-input v-model.number="floyd" type="number" max="1" min="0" size="mini" placeholder="1"></el-input>
          <i>(0-1)</i>
        </el-form-item>
      </el-form>
      <el-form :inline="true">
        <el-form-item>
          <el-checkbox v-model="qualityCheck">quality</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-input v-model.number="quality" type="number" max="100" min="0" size="mini" placeholder="100"></el-input>
          <i>(0-100)</i>
        </el-form-item>
      </el-form>
    </div>
    <el-button type="primary" v-on:click="start('')" :disabled="isStarted">&emsp;开始&emsp;</el-button>
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
      if (this.selectedList[0].basic.type == 'PNGS') {
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
    floydCheck: {
      get () {
        return this.curtSetting.floyd.checked
      },
      set (value) {
        this.$store.dispatch('editMultiOptions', {
          floyd: {
            'checked': value,
            'value': this.floyd
          }
        })
      }
    },
    floyd: {
      get () {
        // console.warn(this.curtSetting.frameRate)
        return this.curtSetting.floyd.value
      },
      set (value) {
        this.$store.dispatch('editMultiOptions', {
          floyd: {
            'checked': this.floydCheck,
            'value': value
          }
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
    changeOutput: function () {
      var outputPath = this.selectedList[0].basic.outputPath
      // console.log(outputPath)
      ipc.send('change-multiItem-fold', outputPath)
    },
    start: function (sameOutputPath) {
      // console.log(sameOutputPath)
      for (var i = 0; i < this.selectedList.length; i++) {
        this.$store.dispatch('editProcess', {
          index: i,
          text: '',
          schedule: 0
        })
      }
      setTimeout(() => {
        this.$store.dispatch('setLock', true)
        processor(this.$store, sameOutputPath).then()
      }, 20)
    }
  },
  watch: {

  }
}
</script>

<style lang="scss">
@import "./setting.scss";
</style>
