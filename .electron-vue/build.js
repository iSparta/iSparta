'use strict'

process.env.NODE_ENV = 'production'

const {
  say
} = require('cfonts')
const chalk = require('chalk')
const del = require('del')
const packager = require('electron-packager')
const createDMG = require('electron-installer-dmg')
const electronInstaller = require('electron-winstaller');
const path = require('path')
const fs = require('fs-extra')
const webpack = require('webpack')
const Multispinner = require('multispinner')

const buildConfig = require('./build.config')
const mainConfig = require('./webpack.main.config')
const rendererConfig = require('./webpack.renderer.config')
const webConfig = require('./webpack.web.config')

const doneLog = chalk.bgGreen.white(' DONE ') + ' '
const errorLog = chalk.bgRed.white(' ERROR ') + ' '
const okayLog = chalk.bgBlue.white(' OKAY ') + ' '
const isCI = process.env.CI || false

if (process.env.BUILD_TARGET === 'clean') clean()
else if (process.env.BUILD_TARGET === 'web') web()
else build()

function clean() {
  del.sync(['build/*', '!build/icons', '!build/icons/icon.*'])
  console.log(`\n${doneLog}\n`)
  process.exit()
}

function build() {
  greeting()

  del.sync(['dist/electron/*', '!.gitkeep'])

  const tasks = ['main', 'renderer']
  const m = new Multispinner(tasks, {
    preText: 'building',
    postText: 'process'
  })

  let results = ''

  m.on('success', () => {
    process.stdout.write('\x1B[2J\x1B[0f')
    console.log(`\n\n${results}`)
    console.log(`${okayLog}take it away ${chalk.yellow('`electron-{{builder}}`')}\n`)
    bundleApp()
  })

  pack(mainConfig).then(result => {
    results += result + '\n\n'
    m.success('main')
  }).catch(err => {
    m.error('main')
    console.log(`\n  ${errorLog}failed to build main process`)
    console.error(`\n${err}\n`)
    process.exit(1)
  })

  pack(rendererConfig).then(result => {
    results += result + '\n\n'
    m.success('renderer')
  }).catch(err => {
    m.error('renderer')
    console.log(`\n  ${errorLog}failed to build renderer process`)
    console.error(`\n${err}\n`)
    process.exit(1)
  })
}

function pack(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) reject(err.stack || err)
      else if (stats.hasErrors()) {
        let err = ''

        stats.toString({
            chunks: false,
            colors: true
          })
          .split(/\r?\n/)
          .forEach(line => {
            err += `    ${line}\n`
          })

        reject(err)
      } else {
        resolve(stats.toString({
          chunks: false,
          colors: true
        }))
      }
    })
  })
}


function bundleApp() {
  packager(buildConfig, (err, appPaths) => {
    if (err) {
      console.log(`\n${errorLog}${chalk.yellow('`electron-packager`')} says...\n`)
      console.log(err + '\n')
    } else {
      packApp(process.env.BUILD_TARGET,appPaths[0]);
    }
  })
}

function packApp(target,appPath) {
  switch (target) {
    case 'darwin':
      console.log(`Moving files...`);
      var upperPath =path.resolve(appPath,"..");
      var sourcesPath = appPath+'/sources';
      var InstallPath = appPath+'/installer';
      var tempPath = upperPath+ '/sources';
      // console.log(`${appPath}`);
      // console.log(`${upperPath}`);
      fs.copy(appPath, tempPath,{
        overwrite:true
      }, err => {
        if (err) return console.error(err)
        fs.emptyDir(appPath, err => {
          if (err) return console.error(err)
          fs.move(tempPath, sourcesPath,{
            overwrite:true
          }, err => {
            // console.log(sourcesPath + '/iSparta2.0.app');
            // console.log(InstallPath);
            fs.ensureDir(InstallPath, err => {
              console.log(`Creating Mac DMG...`);
              createDMG({
                appPath: sourcesPath + '/iSparta.app',
                name: 'iSparta',
                out: InstallPath,
                overwrite: true
              }, function done(err) {
                // console.error(err);
                console.log(`\n${doneLog}\n`)
              })
            })
          })
        })
      })
      break;
      case 'win32':
      case 'win64':
      console.log(`Moving files...`);
      var upperPath =path.resolve(appPath,"..");
      var sourcesPath = appPath+'/sources';
      var InstallPath = appPath+'/installer';
      var tempPath = upperPath+ '/sources';
      // console.log(`${appPath}`);
      // console.log(`${upperPath}`);
      fs.copy(appPath, tempPath,{
        overwrite:true
      }, err => {
        if (err) return console.error(err)
        fs.emptyDir(appPath, err => {
          if (err) return console.error(err)
          fs.move(tempPath, sourcesPath,{
            overwrite:true
          }, err => {
            // console.log(sourcesPath + '/iSparta2.0.app');
            // console.log(InstallPath);
            fs.ensureDir(InstallPath, err => {
              console.log(`Creating Windows Installer...`);
              electronInstaller.createWindowsInstaller({
                  appDirectory: sourcesPath,
                  outputDirectory: InstallPath,
                  authors: 'L',
                  exe: 'iSparta.exe'
                }).then(()=>{
                  console.log(`\n${doneLog}\n`)
                },(e)=>{
                  console.log(`No dice: ${e.message}`);
                })
            })
          })
        })
      })
      break;
      default:
        console.log(`\n${doneLog}\n`)
      break;
  }
}

function web() {
  del.sync(['dist/web/*', '!.gitkeep'])
  webpack(webConfig, (err, stats) => {
    if (err || stats.hasErrors()) console.log(err)

    console.log(stats.toString({
      chunks: false,
      colors: true
    }))

    process.exit()
  })
}

function greeting() {
  const cols = process.stdout.columns
  let text = ''

  if (cols > 85) text = 'lets-build'
  else if (cols > 60) text = 'lets-|build'
  else text = false

  if (text && !isCI) {
    say(text, {
      colors: ['yellow'],
      font: 'simple3d',
      space: false
    })
  } else console.log(chalk.yellow.bold('\n  lets-build'))
  console.log()
}
