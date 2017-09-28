const path = require('path')

/**
 * `electron-packager` options
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-packager.html
 */

var bit = 'x64';
var platform = process.env.BUILD_TARGET;
var ignoreFiles = /(^\/(src|test|\.[a-z]+|README|yarn|dist\/web))|\.gitkeep/;
switch(process.env.BUILD_TARGET){
  case 'darwin':
    ignoreFiles = /(^\/(src|test|\.[a-z]+|README|yarn|dist\/web|static\/icons|static\/bin\/linux|static\/bin\/win32|static\/bin\/win64))|\.gitkeep/
    break;
  case 'win32':
    bit = 'ia32'
    ignoreFiles = /(^\/(src|test|\.[a-z]+|README|yarn|dist\/web|static\/icons|static\/bin\/linux|static\/bin\/mac|static\/bin\/win64))|\.gitkeep/
    break;
  case 'win64':
    platform = 'win32'
    ignoreFiles = /(^\/(src|test|\.[a-z]+|README|yarn|dist\/web|static\/icons|static\/bin\/linux|static\/bin\/mac|static\/bin\/win32))|\.gitkeep/
    break;
  case 'linux':
    ignoreFiles = /(^\/(src|test|\.[a-z]+|README|yarn|dist\/web|static\/icons|static\/bin\/win32|static\/bin\/mac|static\/bin\/win64))|\.gitkeep/
    break;
}

module.exports = {
  arch: bit,
  asar: false,
  dir: path.join(__dirname, '../'),
  icon: path.join(__dirname, '../static/icons/AppIcon'),
  ignore: ignoreFiles,
  out: path.join(__dirname, '../build'),
  overwrite: true,
  platform: platform || 'all'
}
