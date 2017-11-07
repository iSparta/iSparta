// 右键菜单
// import processor from '../../util/processor'

const remote = require('electron').remote
const shell = require('electron').shell
const ipc = require('electron').ipcRenderer
const {
  Menu,
  MenuItem
} = remote

class rightMenu {
  static init (store, option, index, isMultiItems) {
    const menu = new Menu()
    if (!isMultiItems) {
      menu.append(new MenuItem({
        label: '打开文件目录',
        click () {
          var srcPath = option.inputPath.replace(/\/[^\/]*$/, '')
          shell.showItemInFolder(srcPath)
        }
      }))
      menu.append(new MenuItem({
        label: '打开输出目录',
        click () {
          var distPath = option.outputPath
          shell.showItemInFolder(distPath)
        }
      }))
      menu.append(new MenuItem({
        label: '修改输出目录',
        click () {
          ipc.send('change-item-fold', option.outputPath, index)
        }
      }))
      menu.append(new MenuItem({
        type: 'separator'
      }))
    }
    menu.append(new MenuItem({
      label: '删除项目',
      click () {
        store.dispatch('remove')
      }
    }))
    // menu.append(new MenuItem({
    //   type: 'separator'
    // }))
    // menu.append(new MenuItem({
    //   label: '开始执行',
    //   click () {
    //     processor(store).then(() => {})
    //   }
    // }))
    // setTimeout(function(){
    menu.popup(remote.getCurrentWindow())
    // },10)
  }
}

export default rightMenu
