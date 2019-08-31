import fs from 'fs-extra'
import path from 'path'
import action from './action'
import apngCompress from './apngCompress'
import TYPE 		from '../../store/enum/type'

export default function (item, store, locale) {
  store.dispatch('editProcess', {
    index: item.index,
    text: locale.outputing+' WEBP...',
    schedule: 0.8
  })

  var tmpDir = item.basic.tmpDir
  	return action.exec(action.bin('apngdis'), [
    item.basic.fileList[0]
  ], item, store, locale).then(() => {
    var data = fs.readFileSync(path.join(tmpDir, 'apngframe_metadata.json'), {encoding: 'utf-8'})
    var animation = JSON.parse(data)
    var frames = animation['frames']
    var promises = frames.map(function (frame) {
      var png_frame_file = path.join(tmpDir, frame['src'])
      var webp_frame_file = path.join(tmpDir, frame['src'] + '.webp')
      return action.exec(action.bin('cwebp'), [
        //item.basic.type == TYPE.PNGs ? '-q 100' : '-q ' + item.options.quality.value,
        item.options.quality.checked ? '-q ' + item.options.quality.value : '' ,
        png_frame_file,
        '-o ' + webp_frame_file
      ], item, store, locale).then(() => {
        var delay = Math.round((frame['delay_num']) / (frame['delay_den']) * 1000)
        if (delay === 0) { // The specs say zero is allowed, but should be treated as 10 ms.
          delay = 10
        }
        var blend_mode = ''
        if (frame['blend_op'] === 0) {
          blend_mode = '-b'
        } else if (frame['blend_op'] === 1) {
          blend_mode = '+b'
        } else {
          throw new Error("Webp can't handle this blend operation")
        }
        var webpmux_arg = ' -frame "' + path.basename(webp_frame_file) + '" +' + delay + '+' + frame['x'] + '+' + frame['y'] + '+' + frame['dispose_op'] + blend_mode
        return webpmux_arg
      })
    })

    return Promise.all(promises).then(function (args) {
      return Promise.resolve(args.join(' '))
    })
  }).then((args) => {
    return action.exec('cd ' + tmpDir + ' && ' + action.bin('webpmux'), [
      args,
      '-loop ' + item.options.loop,
      '-o ' + path.join(item.basic.tmpOutputDir, item.options.outputName + '.webp')
    ], item, store, locale)
  })
}
