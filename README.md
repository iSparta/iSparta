## iSparta

[![macOS Build](https://img.shields.io/travis/iSparta/iSparta.svg)](https://travis-ci.org/iSparta/iSparta)
[![Windows Build](https://img.shields.io/appveyor/ci/lizhuoli/iSparta.svg)](https://ci.appveyor.com/project/lizhuoli/iSparta)

[English version](https://github.com/iSparta/iSparta/blob/master/README-en.md)

iSparta 是一款 APNG 和 Webp 转换工具。

# 截图

![](https://raw.githubusercontent.com/iSparta/iSparta/master/screenshot/screenshot-zh-cn.png)

# 下载

iSparta现在支持macOS和Windows系统，可以在[官网](http://isparta.github.io/)下载最新版本，或者到[Release](https://github.com/iSparta/iSparta/releases)页面下载历史版本。

# 语言

iSparta现在支持以下语言：

+ 英语
+ 简体中文
+ 繁体中文

# 功能

+ PNG转换APNG  
  将多张PNG合并成一个APNG动图，可以设置帧频率、循环次数等参数。要求PNG在同一目录下，并且保持文件名标准化(1.png, 2.png...)
+ PNG、JPEG转换WebP  
  将PNG、JPEG转换为WebP格式，可以设置无损，压缩比等参数。
+ APNG转换Animated WebP  
  将APNG动图转换为Animated WebP动图，可以设置循环次数，无损等参数。
+ PNG、JPEG和GIF无损压缩  
  将PNG、JPEG和GIF进行无损压缩，减少图片大小。
+ PNG有损压缩  
  将PNG进行有损压缩，可以设置质量、色彩深度数等参数。

# 开发

iSparta使用[nw.js](https://nwjs.io/)框架开发，需要安装[node.js](https://nodejs.org/)。在macOS上可以使用[Homebrew](https://brew.sh/)直接安装，Windows上使用官网安装包进行安装。

安装node依赖：

```bash
cd iSparta/src
npm install
```

由于`nw.js`对每个平台均有一个应用包，且容量较大，因此不放在git repo中，请到[nw.js版本](https://dl.nwjs.io/v0.12.3/)处下载，当前版本使用`nwjs-v0.12.3`构建。或者也可以参考[构建](#构建)说明，使用构建的应用包。

然后，将下载后的应用包解压，放到与`package.json`同级目录，然后执行应用：

```bash
nwjs.app/Contents/MacOS/nwjs ./
```

Windows上可以直接执行`nwjs.exe`

# 构建

准备构建脚本：

```bash
cd iSparta/script
npm install
```

根据不同平台构建，现在支持`osx64`、`win32`和`win64`。

```bash
npm run build osx64
```

然后可以到`script/build/`目录下找到构建好的应用。

注：在macOS下，构建Windows平台的应用包不会内嵌图标到可执行文件中。


# 贡献者
* [DreamPiggy](https://github.com/dreampiggy)

# 致谢

+ [apngasm](http://apngasm.sourceforge.net/)
+ [apng2webp](https://github.com/Benny-/apng2webp)
+ [pngout](http://advsys.net/ken/utils.htm)
+ [pngquant](https://pngquant.org/)
+ [webp](https://developers.google.com/speed/webp/)
