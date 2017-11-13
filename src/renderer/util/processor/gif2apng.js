import path from 'path'
import action from './action'
import fs from 'fs-extra'
import apngCompress from './apngCompress'

export default function (item, store, locale) {
	// apngquant

  store.dispatch('editProcess', {
    index: item.index,
<<<<<<< Updated upstream
    text: '正在解析图片...',
=======
    text: locale.analysing+'...',
>>>>>>> Stashed changes
    schedule: 0.4
  })

  var tmpDir = item.basic.tmpDir
  var tmpFile = path.join(item.basic.tmpOutputDir, item.options.outputName + '.gif')
  fs.ensureDirSync(tmpDir)
  // console.log(item)
  if (tmpFile != item.basic.fileList[0]) {
    fs.copySync(item.basic.fileList[0], tmpFile)
  }

  item.basic.fileList[0] = tmpFile
  // console.log(1)
  var fileName = path.basename(item.basic.fileList[0])
  return action.exec('cd ' + path.dirname(item.basic.fileList[0]) + ' && ' + action.bin('gif2apng'), [
    fileName,
    item.options.outputName + '.png'
<<<<<<< Updated upstream
  ], item, store).then(() => {
=======
  ], item, store, locale).then(() => {
>>>>>>> Stashed changes
    item.basic.fileList = [
      path.join(item.basic.tmpOutputDir, item.options.outputName + '.png')
    ]
    return apngCompress(item, 0, store, locale)
  })
}
