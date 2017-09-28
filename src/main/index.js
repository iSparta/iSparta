'use strict'
const electronLocalshortcut = require('electron-localshortcut')
import {
  app,
  BrowserWindow,
  globalShortcut
} from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    resizable: true,
    minWidth: 820,
    minHeight: 700,
    width: 820,
    height: 700,
    // frame: true,
    titleBarStyle: 'default',
    webPreferences:{
      devTools:true
    }
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // mainWindow.webContents.openDevTools({
  //   mode: 'detach'
  // })

  // CTRL+ALT+I 快捷键调出chrome控制台
  electronLocalshortcut.register(mainWindow, 'CommandOrControl+Alt+I', function () {
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools()
    } else {
      mainWindow.webContents.openDevTools({
        mode: 'detach'
      })
    }
  })

  // CTRL+A 快捷键全选项目
  electronLocalshortcut.register(mainWindow, 'CommandOrControl+A', function () {
    // console.log('You pressed ctrl & a');
    mainWindow.webContents.send('selectAll')
  })

  // CTRL+DEL 快捷键删除项目
  electronLocalshortcut.register(mainWindow, 'CommandOrControl+Backspace', function () {
    // console.log('You pressed ctrl & del');
    mainWindow.webContents.send('delItem')
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

const ipc = require('electron').ipcMain
const dialog = require('electron').dialog
// 监听右键修改输出目录的操作
ipc.on('change-item-fold', function (event, path, order) {
  dialog.showOpenDialog({
    defaultPath: path,
    properties: ['openDirectory']
  }, function (files) {
    if (files) event.sender.send('change-item-fold', files, order)
  })
})
// 监听输出到目录的操作
ipc.on('change-multiItem-fold', function (event, path) {
  dialog.showOpenDialog({
    defaultPath: path,
    properties: ['openDirectory']
  }, function (files) {
    if (files) event.sender.send('change-multiItem-fold', files)
  })
})
// 监听获取应用目录的操作
ipc.on('get-app-path', function (event) {
  event.sender.send('got-app-path', app.getAppPath())
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
