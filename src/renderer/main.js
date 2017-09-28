import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import ElementUI from 'element-ui'
import 'normalize.css/normalize.css'
import 'element-ui/lib/theme-default/index.css'

import AsyncComputed from 'vue-async-computed'

/* Initialize the plugin */
Vue.use(AsyncComputed)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
// 所有子组件都调用这两个模块
Vue.use(ElementUI)

// 过滤文件路径，取文件路径后三级目录。
// "/Works/170816.ispart2/iSparta2.0/test/pngs" -> "../iSparta2.0/test/pngs/"
Vue.filter('basePath', function (value) {
  // console.warn(process.env);
  var basePath = '../' + _.compact(_.takeRight(value.split('/'), 3)).join('/');
  return basePath
})

Vue.filter('fileLink', function (value) {
  // console.log(value)
  // var fileLink = value.split(",")[0];
  return value[0]
})

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
  data: {
    // 注册一个空的 Vue 实例，作为 ‘中转站’
    eventBus: new Vue()
  }
}).$mount('#app')
