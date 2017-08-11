## iSparta

[![macOS Build](https://img.shields.io/travis/iSparta/iSparta.svg)](https://travis-ci.org/iSparta/iSparta)
[![Windows Build](https://img.shields.io/appveyor/ci/lizhuoli/iSparta.svg)](https://ci.appveyor.com/project/lizhuoli/iSparta)

iSparta is a tool for converting APNG and WebP images.

# Screenshot

![](https://raw.githubusercontent.com/iSparta/iSparta/master/screenshot/screenshot-en.png)

# Download

iSparta now supports macOS and Windows, you can download the latest version at [Official Site](http://isparta.github.io/) or previous releases at [Release](https://github.com/iSparta/iSparta/releases) page.

# Language

iSparta now supports following languages:

+ English
+ Simplified Chinese
+ Traditional Chinese

# Feature

+ PNG to APNG  
  Combine multiple PNG to an APNG animated. You can specify arguments like frame rate, loop count, etc. Attention to put all the PNGs into one directory, keep filename serialized(1.png, 2.png...)
+ PNG and JPEG to WebP  
  Convert PNG and JPEG to WebP. You can specify arguments like lossless, compression ratio, etc.
+ APNG to Animated WebP  
  Convert APNG to Animated WebP. You can specify arguments like loop count, lossless, etc.
+ PNG, JPEG and GIF lossless compression  
  Compress PNG, JPEG and GIF losslessly to reduce image size.
+ PNG lossy compression  
  Compress PNG lossy. You can specify arguments like quality, color depth, etc.

# Develop

iSparta use [nw.js](https://nwjs.io/) framework to develop. You need [node.js](https://nodejs.org/) installed. Using [Homebrew](https://brew.sh/) to install on macOS, official installer to install on Windows.

Install node dependencies:

```bash
cd iSparta/src
npm install
```

Because `nw.js` provide a binary bundle for each platform, and its' size is large. So we do not keep the binary bundle into git repo. Go to [nw.js release](https://dl.nwjs.io/v0.12.3/) to download. Currently we use `nwjs-v0.12.3` to build. Or you can check the [Build](#Build) description, use the build binary bundle instead.

Then, unzip the downloaded binary bundle, keep the extracted files at the same level of `package.json`, then run the program:

```bash
nwjs.app/Contents/MacOS/nwjs ./
```

You can execute `nwjs.exe` on Windows.

# Package

Ready for build script:

```bash
cd iSparta/script
npm install
```

build for different platform, now support `osx64`、`win32` and `win64`.

```bash
npm run build osx64
```

Then go to `script/build/` and check the build bundle.


Note：On macOS，the built executable binary for Windows platform will not embed the icon.


# Contributor
* [DreamPiggy](https://github.com/dreampiggy)

# Thanks

+ [apngasm](http://apngasm.sourceforge.net/)
+ [apng2webp](https://github.com/Benny-/apng2webp)
+ [pngout](http://advsys.net/ken/utils.htm)
+ [pngquant](https://pngquant.org/)
+ [webp](https://developers.google.com/speed/webp/)
