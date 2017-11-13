import fs from 'fs-extra'
import path from 'path'
import action from './action'
import apngCompress from './apngCompress'
import PNGs2apng from './PNGs2apng'

export default function (item, store) {
  store.dispatch('editProcess', {
    index: item.index,
    text: locale.analysing+'...',
    schedule: 0.4
  })

  var tmpDir = item.basic.tmpDir
  var webpDir = path.join(item.basic.tmpDir, 'webp')

  var webpDir = path.join(tmpDir, 'webp')
  var tmpFile = path.join(item.basic.tmpOutputDir, item.options.outputName + '.webp')
  fs.ensureDirSync(tmpDir)
  fs.ensureDirSync(webpDir)
  if (tmpFile != item.basic.fileList[0]) {
    fs.copySync(item.basic.fileList[0], tmpFile)
  }

  item.basic.fileList[0] = tmpFile
  var getframeFunc = []

  var isStop = false
  return new Promise(function (resolve, reject) {
    getframe(item, 1, (frames) => {
      var dwebpFunc = []
      for (let i = 1; i <= frames; i++) {
        dwebpFunc.push(action.exec(action.bin('dwebp'), [
          path.join(webpDir, i + '.webp'),
          '-o ' + path.join(webpDir, i + '.png')
        ], item, store, locale).then(() => {
          item.basic.fileList[i - 1] = path.join(webpDir, i + '.png')
          return item.basic.fileList[i]
        }))
      }
      Promise.all(dwebpFunc).then(() => {
        PNGs2apng(item).then(() => {
          resolve()
        })
      })

			// action.exec(action.bin('dwebp'),[
			// ]
    })
  })
}
function getframe (item, frame, callback) {
  var webpDir = path.join(item.basic.tmpDir, 'webp')
  fs.ensureDirSync(webpDir)
  var isStop = false
	// webpmux get wrong size image, so this feature not support yet.
  action.exec(action.bin('webpmux'), [
  		'-get frame ' + frame,
    item.basic.fileList[0],
    '-o ' + path.join(webpDir, frame + '.webp')
  ], item, store, locale).then(() => {
    getframe(item, frame + 1, callback)
  }).catch(() => {
    if ((typeof callback) === 'function') {
      callback(frame - 1)
    }
  })
}
