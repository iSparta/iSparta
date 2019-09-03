import Vue from 'vue'
import Vuex from 'vuex'

import modules from './modules'

import * as types from './mutation-types'
const fs = require("fs-extra");
const storage = require('electron-localstorage');
const os = require("os");
const path = require("path");
// 【bug fix】修复初次使用时读取缓存错误的问题
let storagePath = "";
if (process.env.NODE_ENV == "development") {

  storagePath = path.join(os.tmpdir(), 'iSparta/localstorage-dev.json');
} else {
  storagePath = path.join(os.tmpdir(), 'iSparta/localstorage.json');
}
if (!fs.existsSync(storagePath)) {
  fs.ensureFileSync(storagePath)

}
if (fs.readFileSync(storagePath)) {
  fs.writeFileSync(storagePath, "{}", "utf-8")
}

storage.setStoragePath(storagePath);
window.storage = storage;
Vue.use(Vuex)
// 原始数据
const defaultState = {
  language: 'zh-cn',
  options: {
    'frameRate': 20,
    'loop': 0,
    'outputSuffix': 'iSpt',
    'outputName': '',
    'outputFormat': ['APNG'],
    'floyd': {
      checked: true,
      value: 0.35
    },
    'quality': {
      checked: false,
      value: 80
    }
  },
  basic: {
    fileList: [],
    type: 'APNG',
    thumbPath: '',
    inputPath: '',
    outputPath: ''
  },
  process: {
    text: '',
    schedule: 0
  },
  isSelected: true
}



// state
var state = {
  items: [],
  locked: false
}


//init globalSetting
var globalSetting = window.storage.getItem('globalSetting');

if (!globalSetting) {

  let tempSetting = defaultState;
  window.storage.setItem('globalSetting', JSON.stringify(tempSetting))
}
// get localstorage data
var localData = window.storage.getItem('iSparta-item')
if (localData) {
  // 取loaclstorage时重置进度
  var localItems = JSON.parse(localData)
  let items = [];
  _.each(localItems, function (item) {
    let isError = false;
    for (let i = 0; i < item.basic.fileList.length; i++) {

      if (!fs.existsSync(item.basic.fileList[i])) {
        isError = true;
        break;
      }
    }
    if (!isError) {
      item.process.text = ''
      item.process.schedule = 0;
      items.push(item);
    }
  })
  state.items = items
}
// 只有这里才能才state的值
const mutations = {
  [types.ITEMS_ADD](state, data) {
    if (state.locked) {
      return false
    }
    let tempState = JSON.parse(storage.getItem('globalSetting'));
    // console.log(defaultState);
    var itemData = _.cloneDeep(_.extend(tempState, data))
    _.each(state.items, function (item) {
      item.isSelected = false
    })
    state.items.push(itemData)
    storage.setItem('iSparta-item', JSON.stringify(state.items))
  },
  [types.ITEMS_REMOVE](state) {
    if (state.locked) {
      return false
    }
    var remainList = _.remove(state.items, {
      isSelected: false
    })
    state.items = remainList
    if (state.items.length > 1) {
      state.items[0].isSelected = true
    }
    storage.setItem('iSparta-item', JSON.stringify(state.items))
  },
  [types.ALL_REMOVE](state) {
    if (state.locked) {
      return false
    }

    state.items = []
    storage.setItem('iSparta-item', JSON.stringify(state.items))
  },
  [types.ITEMS_EDIT_BASIC](state, keyValue) {
    if (state.locked) {
      return false
    }
    var selectedItem = _.filter(state.items, { isSelected: true })
    var selectedBasic = selectedItem[0].basic
    _.extend(selectedBasic, keyValue)
    storage.setItem('iSparta-item', JSON.stringify(state.items))
  },
  [types.ITEMS_EDIT_OPTIONS](state, keyValue) {
    if (state.locked) {
      return false
    }
    var selectedItem = _.filter(state.items, { isSelected: true })
    var selectedOption = selectedItem[0].options
    _.extend(selectedOption, keyValue)
    storage.setItem('iSparta-item', JSON.stringify(state.items))
    // var new = _.merge(selectedOption,keyValue)
    // console.log(keyValue)
  },
  [types.ITEMS_EDIT_MULTI_OPTIONS](state, keyValue) {
    if (state.locked) {
      return false
    }
    _.each(state.items, function (item) {
      _.extend(item.options, keyValue)
    })
    storage.setItem('iSparta-item', JSON.stringify(state.items))
  },
  [types.ITEMS_EDIT_PROCESS](state, keyValue) {
    var selectedItem = _.filter(state.items, { isSelected: true })
    // console.warn(keyValue)
    var selectedProcess = selectedItem[keyValue.index].process
    _.extend(selectedProcess, keyValue)

    // 进度不记录在localstore里
    // storage.setItem("iSparta-item",JSON.stringify(state.items));
  },
  [types.SINGLE_SELECT](state, index) {
    if (state.locked) {
      return false
    }
    _.each(state.items, function (item) {
      item.isSelected = false
    })
    state.items[index].isSelected = true
    storage.setItem('iSparta-item', JSON.stringify(state.items))
  },
  [types.SET_SELECTED](state, index) {
    if (state.locked) {
      return false
    }
    state.items[index].isSelected = true
    storage.setItem('iSparta-item', JSON.stringify(state.items))
  },
  [types.MULTI_SELECT](state, index) {
    if (state.locked) {
      return false
    }
    state.items[index].isSelected = !state.items[index].isSelected
    storage.setItem('iSparta-item', JSON.stringify(state.items))
  },
  [types.ALL_SELECTED](state) {
    if (state.locked) {
      return false
    }
    _.each(state.items, function (item) {
      item.isSelected = true
    })
    storage.setItem('iSparta-item', JSON.stringify(state.items))
  },
  [types.SET_LOCK](state, boolean) {
    state.locked = boolean
  }

}
// actions are functions that cause side effects and can involve
// asynchronous operations.
// 主要处理异步事件
const actions = {

  //
  add(context, data) {
    context.commit('ITEMS_ADD', data)
  },
  remove(context) {
    context.commit('ITEMS_REMOVE')
  },
  removeAll(context) {
    context.commit('ALL_REMOVE')
  },
  editBasic(context, keyValue) {
    context.commit('ITEMS_EDIT_BASIC', keyValue)
  },
  editOptions(context, keyValue) {
    context.commit('ITEMS_EDIT_OPTIONS', keyValue)
  },
  editMultiOptions(context, keyValue) {
    context.commit('ITEMS_EDIT_MULTI_OPTIONS', keyValue)
  },
  editProcess(context, keyValue) {
    context.commit('ITEMS_EDIT_PROCESS', keyValue)
  },
  setSelected(context, index) {
    context.commit('SET_SELECTED', index)
  },
  singleSelect(context, index) {
    context.commit('SINGLE_SELECT', index)
  },
  multiSelect(context, index) {
    context.commit('MULTI_SELECT', index)
  },
  allSelect(context) {
    context.commit('ALL_SELECTED')
  },
  setLock(context, boolean) {
    context.commit('SET_LOCK', boolean)
  }
}

// 处理一些分发的事件
const getters = {
  // 获取items
  getterItems() {
    return state.items
  },
  // 获取锁的状态
  getterLocked() {
    return state.locked
  },
  // 获取选中的items
  getterSelected() {
    return _.filter(state.items, { isSelected: true })
  },
  // 获取选中items的index
  getterSelectedIndex() {
    return _.findIndex(state.items, { isSelected: true })
  }
}

// A Vuex instance is created by combining the state, mutations, actions,
// and getters.
export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  modules
})
