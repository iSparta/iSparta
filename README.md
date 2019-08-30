## iSparta 3.1

[![macOS & Linux Build](https://img.shields.io/travis/iSparta/iSparta.svg)](https://travis-ci.org/iSparta/iSparta)
[![Windows Build](https://img.shields.io/appveyor/ci/lizhuoli/iSparta.svg)](https://ci.appveyor.com/project/lizhuoli/iSparta)
[![Total Downloads](https://img.shields.io/github/downloads/iSparta/iSparta/total.svg)](https://github.com/iSparta/iSparta/releases)
[![Lastest release](https://img.shields.io/github/release/iSparta/iSparta.svg)](https://github.com/iSparta/iSparta/releases/latest)

iSparta 是一款 APNG 和 Webp 转换工具。

# 截图

<img src="https://raw.githubusercontent.com/iSparta/iSparta/master/public/screenshot/iSparta3.1.png" alt="screenshot" width="600">

# 下载

iSparta现在支持macOS、Windows和Linux系统。你可以在我们的[官网](http://isparta.github.io/)下载最新版本，或者到[Release](https://github.com/iSparta/iSparta/releases)页面下载历史版本。

# 语言

iSparta现在支持以下语言：

+ 简体中文
+ 繁體中文
+ English

# 功能

+ PNGs转换APNG  
  将多张PNG合并成一个APNG动图，可以设置帧频率、循环次数等参数。要求PNG在同一目录下，并且保持文件名标准化(1.png, 2.png...)
+ PNG、GIF转换WebP  
  将PNG、GIF转换为WebP格式，可以设置无损，压缩比等参数。
+ APNG转换Animated WebP  
  将APNG动图转换为Animated WebP动图，可以设置循环次数，无损等参数。
+ PNG和GIF无损压缩  
  将PNG和GIF进行无损压缩，减少图片大小。
+ PNGs单独设置帧频
  可以给每一帧单独设置帧频，以满足个性化诉求


# 开发

iSparta使用[electron](https://electron.atom.io/)框架开发，需要安装[node.js](https://nodejs.org/)。在macOS上可以使用[Homebrew](https://brew.sh/)直接安装，Windows上使用官网安装包进行安装，Linux上使用[包管理器](https://nodejs.org/en/download/package-manager/)安装。

注：在Linux环境下，需要安装依赖`libpng16`，可使用包管理器安装：

```bash
sudo apt-get install libpng16-dev
```

安装node依赖：

```bash
cd iSparta
npm install
```

执行命令：
```bash
npm run dev
```

# 构建


根据不同平台构建，现在支持`osx64`、`win32`、`win64`和`linux`。


```bash
npm run build
```

然后可以到`dist_electron/`目录下找到构建好的应用。



# To-Do List

* 增加热更新支持
* 增加视频转apng

# 作者
* [jeakey](https://github.com/jeakey)
* [ccJUN](https://github.com/ccJUN)
* [yikfun](https://github.com/yikfun)

# 贡献者
* [DreamPiggy](https://github.com/dreampiggy)

# 致谢

+ [apngasm](http://apngasm.sourceforge.net/)
+ [apngopt](https://sourceforge.net/projects/apng/files/APNG_Optimizer/)
+ [apng2webp](https://github.com/Benny-/apng2webp)
+ [pngout](http://advsys.net/ken/utils.htm)
+ [pngquant](https://pngquant.org/)
+ [webp](https://developers.google.com/speed/webp/)
