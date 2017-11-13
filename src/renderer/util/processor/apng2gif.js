import path from 'path'
import action from './action'
import fs from 'fs-extra'

export default function (item, store, locale) {
  store.dispatch('editProcess', {
    index: item.index,
<<<<<<< Updated upstream
    text: '正在输出GIF...',
=======
    text: locale.outputing+' GIF...',
>>>>>>> Stashed changes
    schedule: 0.8
  })

  var tmpDir = item.basic.tmpDir
  var tmpFile = path.join(item.basic.tmpOutputDir, item.options.outputName + '.png')

  fs.ensureDirSync(tmpDir)
  if (tmpFile != item.basic.fileList[0]) {
    fs.copySync(item.basic.fileList[0], tmpFile)
  }

  item.basic.fileList[0] = tmpFile

  var fileName = path.basename(item.basic.fileList[0])
  return action.exec('cd ' + path.dirname(item.basic.fileList[0]) + ' && ' + action.bin('apng2gif'), [
    fileName,
    item.options.outputName + '.gif'
<<<<<<< Updated upstream
  ], item, store)
=======
  ], item, store, locale)
>>>>>>> Stashed changes
}
