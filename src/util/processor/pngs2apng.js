import fs from 'fs-extra'
import path from 'path'
import action from './action'
import apngCompress from './apngCompress'

export default function (item, store, locale) {
  store.dispatch('editProcess', {
    index: item.index,
    text: locale.analysing + '...',
    schedule: 0.4
  })

	// copy filelist to temp dir
  var tmpDir = item.basic.tmpDir
  var numLen = item.basic.fileList.length.toString().split('').length
  fs.ensureDirSync(tmpDir)
  var firstPNG = ''
  item.basic.fileList.forEach((file, index) => {
    fs.copySync(file, path.join(tmpDir, 'apng' + action.pad(index + 1, numLen) + '.png'))
    if (item.options.delays && item.options.delays[index]){
      fs.writeFileSync(path.join(tmpDir, 'apng' + action.pad(index + 1, numLen) + '.txt'), "delay=" + item.options.delays[index]*1000+"/1000")
    }
    if (index == 0) {
      firstPNG = 'apng' + action.pad(index + 1, numLen) + '.png'
    }
  })
  
	// apngasm
  return action.exec(action.bin('apngasm'), [
    path.join(item.basic.tmpOutputDir, item.options.outputName + '.png'),
    path.join(tmpDir, firstPNG),
    '1 ' + item.options.frameRate,
    '-l' + item.options.loop,
    '-kc '
  ], item, store, locale).then(() => {
		// reset fileList
    item.basic.fileList = [
      path.join(item.basic.tmpOutputDir, item.options.outputName + '.png')
    ]
    return apngCompress(item, 0, store, locale)
  })
}
