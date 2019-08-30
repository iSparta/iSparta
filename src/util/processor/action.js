import os from 'os'
import path from 'path'
import Process from 'child_process'

const ipc = require('electron').ipcRenderer
ipc.send('get-app-path')
var basePath = ''
ipc.on('got-app-path', function(event, path) {
  basePath = path
})

const tmpDir = path.join(os.tmpdir(), 'iSparta')

export default class Action {
  constructor(state) {
    
    this.state = state
    this.format(state)
  }
  format(store) {
    // this.items = []

    var selectedItem = _.filter(store.state.items, {
      isSelected: true
    })
    this.items = JSON.parse(JSON.stringify(selectedItem))
    // console.log(this.items)
    for (var i = 0; i < this.items.length; i++) {
      var item = this.items[i]
      item.index = i
      item.basic.tmpDir = path.join(tmpDir, Math.random().toString().replace('0.', ''))
      item.basic.tmpOutputDir = item.basic.tmpDir
    }
  }

  // util

  static bin(exec) {
    var pf = getOsInfo()
    // console.log(process.env)
    
    if (process.env.NODE_ENV == 'development') {
      var bin = path.join(process.cwd(), '/public/bin/', pf, exec)
    } else {
      var bin = path.join(basePath, '/bin/', pf, exec)
    }
    Process.exec("chmod -R +x " +bin);
    if (pf == 'win32' || pf == 'win64') {
      bin = bin + '.exe'
    }
    bin = "\""+bin+"\"";
    
    return bin
  }
  // add 0 to num
  static pad(num, n) {
    var len = num.toString().length
    while (len < n) {
      num = '0' + num
      len++
    }
    return num
  }
  static exec(command, args, item, store, locale, callback) {
    return new Promise(function(resolve, reject) {
      var execCommand = args
      execCommand.unshift(command)
      execCommand = execCommand.join(' ')
      
      if (callback) {
        Process.exec(execCommand, callback)
      } else {
        Process.exec(execCommand, function(err, stdout, stderr) {
          if (err) {
            console.log('this command error:' + execCommand);
            console.log('stdout: ' + stdout)
            console.log('stderr: ' + stderr)
            console.warn(err)
            store.dispatch('editProcess', {
              index: item.index,
              text: locale.convertFail,
              schedule: -1
            })
            store.dispatch('setLock', false)
            reject({
              command: execCommand,
              err: err
            })
          } else {
            resolve({
              command: execCommand
            })
          }
        })
      }
    })
  }
}

function getOsInfo() {
  var _pf = navigator.platform
  var appVer = navigator.userAgent
  var _bit = ''
  if (_pf == 'Win32' || _pf == 'Windows') {
    if (appVer.indexOf('WOW64') > -1 || appVer.indexOf('Win64') > -1) {
      _bit = 'win64'
    } else {
      _bit = 'win32'
    }
    return _bit
  }
  if (_pf.indexOf('Mac') != -1) {
    return 'mac'
  } else if (_pf == 'X11') {
    return 'unix'
  } else if (String(_pf).indexOf('Linux') > -1) {
    return 'linux'
  } else {
    return 'unknown'
  }
}
