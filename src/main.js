import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'normalize.css/normalize.css'
import AsyncComputed from 'vue-async-computed'
import VueI18n from 'vue-i18n'
// const storage = require('electron-localstorage');

Vue.config.productionTip = false
Vue.use(VueI18n)

/* Initialize the plugin */
Vue.use(AsyncComputed)
Vue.use(ElementUI)

let globalSetting = window.storage.getItem('globalSetting');
let defaultLanguage = 'zh-cn';
if (globalSetting) {
  var setting = JSON.parse(globalSetting);
  defaultLanguage = setting.language;
}
const i18n = new VueI18n({
  locale: defaultLanguage, // set locale
  messages: {
    'zh-cn': require('./locales/zh-cn'),
    'zh-tw': require('./locales/zh-tw'),
    'en-us': require('./locales/en-us')
  }
})
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
new Vue({
  router,
  i18n,
  store,
  render: h => h(App),
  data: {
    // 注册一个空的 Vue 实例，作为 ‘中转站’
    eventBus: new Vue()
  }
}).$mount('#app')
