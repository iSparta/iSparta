## iSparta

[English version](https://github.com/dreampiggy/iSparta/blob/master/README-en.md)

iSparta 是一款 APNG 和 Webp 转换工具。

# 截图

![](https://raw.githubusercontent.com/dreampiggy/iSparta/master/screenshot/screenshot-zh-cn.png)

# 下载

iSparta现在支持macOS和Windows系统，可以在[Release](https://github.com/dreampiggy/iSparta/releases)页面进行下载。

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

由于`nw.js`对每个平台均有一个应用包，且容量较大，因此不放在git repo中，请到[nw.js版本](https://dl.nwjs.io/v0.12.3/)处下载，当前版本使用`nwjs-v0.12.3`构建。

然后，将下载后的应用包解压，放到与`package.json`同级目录，然后执行应用：

```bash
nwjs.app/Contents/MacOS/nwjs ./
```

Windows上可以直接执行`nwjs.exe`

# 打包
参考[nwjs官方文档](https://github.com/nwjs/nw.js/wiki/how-to-package-and-distribute-your-apps)，只需要下载好对应平台的二进制，新建文件夹`build`，将整个项目目录以下文件/文件夹复制到`build`中。

+ `app`
+ `node_modules`
+ `package.json`

macOS上，将`build`放入应用包中，改名为`app.nw`，然后整体打包

```bash
mv build nwjs.app/Contents/Resources/app.nw
zip -r iSparta-mac.zip nwjs.app
```

Windows上，将`build`放入到可执行文件`nwjs.exe`的同级目录下，改名为`package.nw`，然后整体打包

在`icon`目录下有应用的图标，可以按需替换

# 贡献者
* [DreamPiggy](https://github.com/dreampiggy)

# 致谢

+ [apngasm](http://apngasm.sourceforge.net/)
+ [apng2webp](https://github.com/Benny-/apng2webp)
+ [pngout](http://advsys.net/ken/utils.htm)
+ [pngquant](https://pngquant.org/)
+ [webp](https://developers.google.com/speed/webp/)
