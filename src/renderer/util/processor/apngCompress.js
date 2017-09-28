import path from 'path'
import action from './action'
import fs from 'fs-extra'

export default function (item, isLossless, store) {
  store.dispatch('editProcess', {
    index : item.index,
    text: '正在压缩图片...',
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
    return apngopt(item, store)
  } else {
    return action.exec(action.bin('apngquant'), [
      item.basic.fileList[0],
      '--output ' + path.join(item.basic.tmpOutputDir, item.options.outputName + '-quant.png'),
      '--force',
      item.options.floyd.checked ? ('--floyd=' + item.options.floyd.value) : '',
      item.options.quality.checked ? ('--quality ' + item.options.quality.value) : ''
    ],item,store).then(() => {
      item.basic.fileList[0] = path.join(item.basic.tmpOutputDir, item.options.outputName + '-quant.png')
      return apngopt(item, store)
    })
  }
}
function apngopt (item, store) {
  return action.exec(action.bin('apngopt'), [
    item.basic.fileList[0],
    path.join(item.basic.tmpOutputDir, item.options.outputName + '.png'),
    '-z2'
  ],item,store)
}
