## iSparta

[![macOS Build](https://img.shields.io/travis/iSparta/iSparta.svg)](https://travis-ci.org/iSparta/iSparta)
[![Windows Build](https://img.shields.io/appveyor/ci/lizhuoli/iSparta.svg)](https://ci.appveyor.com/project/lizhuoli/iSparta)

iSparta is a tool for converting APNG and WebP images.

# Screenshot

![](https://raw.githubusercontent.com/dreampiggy/iSparta/master/screenshot/screenshot-en.png)

# Download

iSparta now supports macOS and Windows, you can download it at [Release](https://github.com/dreampiggy/iSparta/releases) page.

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

Because `nw.js` provide a binary bundle for each platform, and its' size is large. So we do not keep the binary bundle into git repo. Go to [nw.js release](https://dl.nwjs.io/v0.12.3/) to download. Currently we use `nwjs-v0.12.3` to build.

Then, unzip the downloaded binary bundle, keep the extracted files at the same level of `package.json`, then run the program:

```bash
nwjs.app/Contents/MacOS/nwjs ./
```

You can execute `nwjs.exe` on Windows.

# Package

According to [nwjs docs](https://github.com/nwjs/nw.js/wiki/how-to-package-and-distribute-your-apps), you need to download the binary bundle for target platform. Then create a directory named `build`, copy these files in the project folder files into `build`:

+ `app`
+ `node_modules`
+ `package.json`

on macOS, move the `build` directory into binary bundle and rename to `app.nw`, then package the entire folder.

```bash
mv build nwjs.app/Contents/Resources/app.nw
zip -r iSparta-mac.zip nwjs.app
```

on Windows上, move the `build` directory into the same level as `nwjs.exe` and rename it to `package.nw`. Then package the entire folder.

The application icon is under `icon` directory, you can use them as needed.

# Thanks

+ [apngasm](http://apngasm.sourceforge.net/)
+ [apng2webp](https://github.com/Benny-/apng2webp)
+ [pngout](http://advsys.net/ken/utils.htm)
+ [pngquant](https://pngquant.org/)
+ [webp](https://developers.google.com/speed/webp/)
