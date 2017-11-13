import path from 'path'
import action from './action'
import fs from 'fs-extra'

export default function (item, isLossless, store, locale) {
  store.dispatch('editProcess', {
    index: item.index,
<<<<<<< Updated upstream
    text: '正在压缩图片...',
=======
    text: locale.compressing+'...',
>>>>>>> Stashed changes
    schedule: 0.6
  })

  var tmpDir = item.basic.tmpDir
  // console.log(item)
  var tmpFile = path.join(item.basic.tmpOutputDir, item.options.outputName + '.png')
  fs.ensureDirSync(tmpDir)
  if (tmpFile != item.basic.fileList[0]) {
    fs.copySync(item.basic.fileList[0], tmpFile)
  }

  item.basic.fileList[0] = tmpFile

	// apngquant
  if (isLossless) {
    return apngopt(item, store, locale)
  } else {
    return action.exec(action.bin('apngquant'), [
      item.basic.fileList[0],
      '--output ' + path.join(item.basic.tmpOutputDir, item.options.outputName + '-quant.png'),
      '--force',
      item.options.floyd.checked ? ('--floyd=' + item.options.floyd.value) : '',
<<<<<<< Updated upstream
      item.options.quality.checked ? ('--quality ' + item.options.quality.value) : ''
    ], item, store).then(() => {
=======
      item.options.quality.checked ? ('--quality=0-' + item.options.quality.value) : ''
    ], item, store, locale).then(() => {
>>>>>>> Stashed changes
      item.basic.fileList[0] = path.join(item.basic.tmpOutputDir, item.options.outputName + '-quant.png')
      return apngopt(item, store, locale)
    })
  }
}
function apngopt (item, store, locale) {
  return action.exec(action.bin('apngopt'), [
    item.basic.fileList[0],
    path.join(item.basic.tmpOutputDir, item.options.outputName + '.png'),
    '-z2'
<<<<<<< Updated upstream
  ], item, store)
=======
  ], item, store, locale)
>>>>>>> Stashed changes
}
