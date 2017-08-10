var NwBuilder = require('nw-builder');
var path = require('path');

var nwBuildConfig = {
    version: '0.12.3', // nw.js version
    macIcns: '../icon/iSparta.icns', // macOS icon
    winIco: '../icon/iSparta.ico', // Windows icon
    zip: false, // do not zip the nw.js files to executable to speed up launch time
    flavor: 'normal' // use the normal build bundle instead of sdk
};

var nwRoot = path.join(__filename, 	'../../src');

var platform = process.argv[2];
if (platform === 'osx64') {
	nwBuildConfig['platforms'] = ['osx64'];
	nwBuildConfig['files'] = [nwRoot + '/**', '!' + nwRoot + '/app/libs/**/{win32,win64}/**'];
} else if (platform === 'win64') {
	nwBuildConfig['platforms'] = ['win64'];
	nwBuildConfig['files'] = [nwRoot + '/**', '!' + nwRoot + '/app/libs/**/{mac,win32}/**'];
} else if (platform === 'win32') {
	nwBuildConfig['platforms'] = ['win32'];
	nwBuildConfig['files'] = [nwRoot + '/**', '!' + nwRoot + '/app/libs/**/{mac,win64}/**'];
} else {
	console.error('build platform for: ' + platform + ' is not supported');
	process.exit(1);
}


var nw = new NwBuilder(nwBuildConfig);

//Log stuff you want

nw.on('log',  console.log);

// Build returns a promise
nw.build().then(function () {
   console.log('all done!');
}).catch(function (error) {
    console.error(error);
});