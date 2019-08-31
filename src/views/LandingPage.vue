<template>
  <div id="wrapper" @dragover.prevent @drop="beforeUpload">
    <main-upload></main-upload>
    <globalsetting></globalsetting>
    <div class="wrap-main">
        <project-list></project-list>
        <sort-bar></sort-bar>
    </div>
    <div class="wrap-side">
        <setting></setting>
    </div>
  </div>
</template>

<script>
import mainUpload from '../components/mainUpload/mainUpload.vue'
import projectlist from '../components/projectList/projectList.vue'
import globalSetting from '../components/globalSetting/globalSetting.vue'
import sortBar from '../components/sortBar/sortBar.vue'
import setting from '../components/setting/setting.vue'
import { f as fsOperate } from '../components/drag/file.js'
import * as d from '../components/drag/drag.js'
export default {
  name: 'landing-page',
  components: {
    'main-upload': mainUpload,
    'project-list': projectlist,
    'sort-bar': sortBar,
    'setting': setting,
    'globalsetting': globalSetting
  },

  methods: {
    open (link) {
      this.$electron.shell.openExternal(link)
    },
    beforeUpload (ev) {
      ev.preventDefault()
      let file = ev.dataTransfer.files
      fsOperate.readerFiles(file).then((ars) => {
              // var tempars = []
        var Obj = {}
        for (var i in ars) {
          Obj.basic = ars[i].basic
          Obj.options = ars[i].options
          this.$store.dispatch('add', Obj)
        }
      })
      return false
    }
  }
}

// 统计代码
var _mtac = {'performanceMonitor': 1, 'senseQuery': 1};
(function () {
  var mta = document.createElement('script')
  mta.src = 'http://pingjs.qq.com/h5/stats.js?v2.0.4'
  mta.setAttribute('name', 'MTAH5')
  mta.setAttribute('sid', '500593887')
  mta.setAttribute('cid', '500593896')
  var s = document.getElementsByTagName('script')[0]
  s.parentNode.insertBefore(mta, s)
})()
</script>

<style lang="scss">
.wrap-main{
  position:fixed;
  left:0;
  top:0;
  bottom:40px;
  right:30%;
  overflow:auto;
}
.wrap-side{
  position:fixed;
  left:70%;
  top:0;
  bottom:0;
  right:0;
  overflow:auto;
}
body{
  -webkit-user-select: none;
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
}
</style>
