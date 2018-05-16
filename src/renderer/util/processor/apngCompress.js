import path from 'path'
import action from './action'
import fs from 'fs-extra'

export default function (item, isLossless, store, locale) {
  store.dispatch('editProcess', {
    index: item.index,
    text: locale.compressing + '...',
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
  if (!item.options.quality.checked) {
    return apngopt(item, store, locale)
  } else {
    return action.exec(action.bin('apngquant'), [
      item.basic.fileList[0],
      '--output ' + path.join(item.basic.tmpOutputDir, item.options.outputName + '-quant.png'),
      '--force',
      item.options.floyd.checked ? ('--floyd=' + item.options.floyd.value) : '',
      item.options.quality.checked ? ('--quality=0-' + item.options.quality.value) : ''
    ], item, store, locale).then(() => {
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
  ], item, store, locale)
}
