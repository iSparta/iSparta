import apng2gif 	from './apng2gif'
import apng2webp 	from './apng2webp'
import apngCompress from './apngCompress'
import gif2apng 	from './gif2apng'
import PNGs2apng 	from './pngs2apng'
import webp2apng 	from './webp2apng'
import Action 		from './action'
import fs 			from 'fs-extra'
import path 		from 'path'
import TYPE 		from '../../store/enum/type'

export default function (store, sameOutputPath, locale) {
  // console.log(locale)
  var action = new Action(store)
	// var promise=null;
  var itemPromises = []

  // console.log(sameOutputPath);
  for (var i = 0; i < action.items.length; i++) {
    let item = action.items[i]
    // let item = JSON.parse(JSON.stringify(action.items[i]))
    var promise = null

    // 统一输出到目录
    if (sameOutputPath) {
      item.basic.outputPath = sameOutputPath
    }

    store.dispatch('editProcess', {
      index: item.index,
      text: locale.startConvert + '...',
      schedule: 0.1
    })

    switch (item.basic.type) {
      case TYPE.PNGs:
        promise = PNGs2apng(item, store, locale).then(() => {
          return apng2other(item, store, locale)
        })
        break

      case TYPE.GIF:
        promise = gif2apng(item, store, locale).then(() => {
          return apng2other(item, store, locale)
        })
        break

      case TYPE.APNG:
        promise = apngCompress(item, 0, store, locale).then(() => {
          return apng2other(item, store, locale)
        })
        break

      case TYPE.WEBP:
        promise = webp2apng(item, store, locale).then(() => {
          return apng2other(item, store, locale)
        })
        break
    }
    itemPromises.push(promise)
  }

  return Promise.all(itemPromises).then(() => {
    for (var i = 0; i < action.items.length; i++) {
      fs.remove(action.items[i].basic.tmpDir);
    }
    store.dispatch('setLock', false)
  })
}
function apng2other (item, store, locale) {
  var funcArr = []
  var hasApng = false
  item.basic.fileList[0] = path.join(item.basic.tmpOutputDir, item.options.outputName + '.png')
  item.options.outputFormat.forEach((el, index) => {
    switch (el) {
      case TYPE.APNG:
        fs.copySync(
				path.join(item.basic.tmpOutputDir, item.options.outputName + '.png'),
				path.join(item.basic.outputPath, item.options.outputName + '.png')
			)
        break

      case TYPE.GIF:
        funcArr.push(apng2gif(item, store, locale).then(() => {
          return fs.copy(
					path.join(item.basic.tmpOutputDir, item.options.outputName + '.gif'),
					path.join(item.basic.outputPath, item.options.outputName + '.gif')
				)
        }))
        break

      case TYPE.WEBP:
        funcArr.push(apng2webp(item, store, locale).then(() => {
          fs.copySync(
					path.join(item.basic.tmpOutputDir, item.options.outputName + '.webp'),
					path.join(item.basic.outputPath, item.options.outputName + '.webp')
				)
        }))
    }
    MtaH5.clickStat(item.basic.type + "-" + el)
  })
	// copy tempdir file to output dir
  return Promise.all(funcArr).then(() => {
		// delete tmp dir
    // return fs.remove(item.basic.tmpOutputDir)
    MtaH5.clickStat('1')
    store.dispatch('editProcess', {
      index: item.index,
      text: locale.convertSuccess + '！',
      schedule: 1
    })
  })
}
