import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import ElementUI from 'element-ui'
import 'normalize.css/normalize.css'
import 'element-ui/lib/theme-default/index.css'

import AsyncComputed from 'vue-async-computed'

import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

/* Initialize the plugin */
Vue.use(AsyncComputed)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
// 所有子组件都调用这两个模块
Vue.use(ElementUI)

// 过滤文件路径，取文件路径后三级目录。
// "/Works/170816.ispart2/iSparta2.0/test/PNGs" -> "../iSparta2.0/test/PNGs/"
Vue.filter('basePath', function (value) {
  // console.warn(process.env);
  var basePath = '../' + _.compact(_.takeRight(value.split('/'), 3)).join('/')
  return basePath
})

Vue.filter('fileLink', function (value) {
  // console.log(value)
  // var fileLink = value.split(",")[0];
  return value[0]
})

let globalSetting = window.localStorage.getItem('globalSetting');
let defaultLanguage = 'zh-cn';
if(globalSetting){
  var setting = JSON.parse(globalSetting);
  defaultLanguage = setting.language;
}
const i18n = new VueI18n({
  locale: defaultLanguage, // set locale
  messages:{
    'zh-cn':require('./locales/zh-cn'),
    'zh-tw':require('./locales/zh-tw'),
    'en-us':require('./locales/en-us')
  }
})

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  i18n,
  template: '<App/>',
  data: {
    // 注册一个空的 Vue 实例，作为 ‘中转站’
    eventBus: new Vue()
  }
}).$mount('#app')
