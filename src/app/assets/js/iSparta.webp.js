;(function ($) {

    var fs = require('fs'),
        path = require('path'),
        gui = require('nw.gui'),
        exec = require('child_process').exec,
        i18n = require('i18n');

        // topbar
        $config = $("#webp_select_config"),
        $ratio = $("#webp_select_ratio"),
        $savePath = $("#webp_select_savePath"),
        $btnSavePath = $("#webp_btn_savePath"),
        $hSavePath = $("#webp_savePath_hidden"),
        $btnCov = $("#webp_btn_cov"),
        $btnOpenSavePath = $("#webp_btn_openSavePath"),

        // preview
        $boxPreview = $("#pngToWebp .box_preview"),
        $dragArea = $("#pngToWebp .drag_area"),

        // status
        $currentLanguage=$("#webp_select_language"),
        $currentPath = $("#webp_select_currentPath"),
        $btnCurrentPath = $("#webp_btn_currentPath"),
        $hPath = $("#webp_path_hidden"),
        $btnOpenPath = $("#webp_btn_openPath"),
        $refresh = $("#webp_currentPath_refresh"),

        // data
        localData = window.iSparta.localData;


    window.iSparta.webp = {

        options: {
            config: '',                         // 有损/无损
            ratio: '75',                        // 压缩比例
            savePath: ["self","parent"],        // 保存路径数组
            currentPath: [],                    // 当前预览区域路径
            otherFiles: [],                     // 其他
            savePathIndex: 0,                   // 保存路径索引
            currentPathIndex: 0                 // 当前路径索引
        },

        dirName: '',            // 文件夹名
        fileList: {},           // 文件列表
        files: {},              // 临时文件对象
        finalSavePath: '',      // 历史文件保存路径
        cwebp: '',              // webp lib路径
        param: '',              // 压缩参数
        o_dirSize: 0,           // 初始文件夹大小
        c_dirSize: 0,           // 压缩后文件夹大小
        isDir: true,            // 是否目录
        isStop: false,          // 是否中止转换


        init: function() {

            var defaultJson = {"config":"","ratio":"75","savePath":["self","parent"],"currentPath":[""],"otherFiles":[],"savePathIndex":0,"currentPathIndex":0},
                options = localData.getJSON("webp") || defaultJson,
                length  = options.savePath.length,
                clength = options.currentPath.length,
                opt;

            $.extend(this.options, options);
            
            options = this.options;
            $config.val(options.config);
            $ratio.val(options.ratio);
            $currentLanguage.val(window.iSparta.locale.getLocale());
            
            for (var i=0; i<length; i++) {
                if (options.savePath[i] == "parent") {
                    opt = new Option(i18n.__("Parent directory"), options.savePath[i]);
                }
                else if (options.savePath[i] =="self") {
                    opt = new Option(i18n.__("Same level directory"), options.savePath[i]);
                }
                else {
                    opt = new Option(options.savePath[i], options.savePath[i]);
                }

                if (i == options.savePathIndex) {
                    $(opt).attr("selected", "selected");
                }
                $savePath[0].options.add(opt);
            }

            for (var i=0; i<clength; i++) {
                var opt = new Option(options.currentPath[i], options.currentPath[i]);

                if (i == options.currentPathIndex) {
                    $(opt).attr("selected", "selected");
                    ui.fillImgDirList(options.currentPath[i] + path.sep);
                    this.dirName = options.currentPath[i] + path.sep;
                }
                $currentPath[0].options.add(opt);
            }
            ui.init();
        },


        convert: function(dir) {

            console.log(this.isStop)
            this.c_dirSize = 0;

            var webp = window.iSparta.webp,
                ui = window.iSparta.ui,
                dConfig = ' -m 6 ',
                savePath = this.options.savePath[this.options.savePathIndex],
                config = this.options.config === '' ? '-lossy' : '-lossless';

            this.cwebp = process.cwd() + '/app/libs/webp/'+iSparta.getOsInfo()+'/cwebp';
            this.param = dConfig + this.options.config + ' -q ' + this.options.ratio + ' ';
            this.currentPath = this.options.currentPath[this.options.currentPathIndex];
            // this.dirName = this.currentPath.substring(this.currentPath.lastIndexOf(path.sep)+1) + '-webp' + config + this.options.ratio;

            if (savePath == 'parent') {
                this.finalSavePath = this.currentPath.substring(0, this.currentPath.lastIndexOf(path.sep)) + path.sep;
            }
            else if (savePath == 'self') {
                this.finalSavePath = this.currentPath + path.sep;
            }
            else {
                this.finalSavePath = savePath + path.sep;
            }

            console.log('finalSavePath::'+ this.finalSavePath);

            try {
                if (!fs.existsSync(this.finalSavePath)) {
                    fs.mkdirSync(this.finalSavePath)
                }
            } catch (err) {
                console.log('err:' + err);
            }

            // directory
            if (webp.isDir) {
                fs.readdir(dir, function(err, files) {
                    if (err) throw err;
                    else {
                        var newFilesArr = [];

                        for (var item in files) {
                            if (files[item].indexOf('.jpg') != -1 || files[item].indexOf('.png') != -1 || files[item].indexOf('.JPG') != -1) {
                                newFilesArr.push(files[item]);
                            }
                        }
                        webp.files = newFilesArr;
                        if (newFilesArr.length > 0) {
                            webp.control(0);
                        }
                    }
                });
            } 
            // files
            else {
                var newFileList = {},
                    index = 0;

                for (var i in webp.fileList) {
                    if (webp.fileList[i]['path'] !== undefined && (webp.fileList[i]['path'].indexOf('.jpg') !== -1 || webp.fileList[i]['path'].indexOf('.png') !== -1 || webp.fileList[i].indexOf('.JPG') != -1)) {
                        newFileList[index] = webp.fileList[i];
                        index++;
                    }
                }
                newFileList['length'] = index;
                webp.files = newFileList;
                if (newFileList.length > 0) {
                   webp.control(0);
                }
            }
        },


        control: function(i) {
            var ui = window.iSparta.ui,
                webp = window.iSparta.webp,
                self = this;

            if (i < this.files.length && !this.isStop) {
                var progress = (i+1)/this.files.length;
                ui.showProgress(progress, i18n.__("Processing images: (%s/%s)", i+1, this.files.length), function(){
                    self.isStop = true;
                    ui.hideLoading();
                });
                webp._exec(i);
            }
            else {
                var Allinfo = [];
                var info = {};
                info.beforesize = this.o_dirSize;
                info.aftersize = this.c_dirSize;
                Allinfo.push(info);

                ui.hideProgress();
            }
        },


        _exec: function(i) {
            var ui = window.iSparta.ui,
                webp = window.iSparta.webp;

            if (webp.isDir) {
                console.log('"'+this.cwebp+'" '+this.param+'"'+this.currentPath+path.sep+this.files[i]+'"'+ ' -o ' + '"' + this.finalSavePath + this.files[i].substring(0, this.files[i].lastIndexOf('.')) + '.webp"');

                exec('"'+this.cwebp+'" '+this.param+'"'+this.currentPath+path.sep+this.files[i]+'"'+ ' -o ' + '"' + this.finalSavePath + this.files[i].substring(0, this.files[i].lastIndexOf('.')) + '.webp"', {timeout: 1000000}, function() {
                    webp.c_dirSize += fs.statSync(webp.finalSavePath + webp.files[i].substring(0, webp.files[i].lastIndexOf('.')) + '.webp').size;
                    if (!this.isStop) {
                        webp.control(i+1);    
                    }
                });
            } else {
                console.log('"'+this.cwebp+'" '+this.param+'"'+this.currentPath+path.sep+this.files[i].name+'"'+ ' -o ' + '"' + this.finalSavePath + this.files[i].name.substring(0, this.files[i].name.lastIndexOf('.')) + '.webp"');

                exec('"'+this.cwebp+'" '+this.param+'"'+this.currentPath+path.sep+this.files[i].name+'"'+ ' -o ' + '"' + this.finalSavePath + this.files[i].name.substring(0, this.files[i].name.lastIndexOf('.')) + '.webp"', {timeout: 1000000}, function() {
                    webp.c_dirSize += fs.statSync(webp.finalSavePath + webp.files[i].name.substring(0, webp.files[i].name.lastIndexOf('.')) + '.webp').size;
                    if (!this.isStop) {
                        webp.control(i+1);    
                    }
                });
            }
        }
    }


    /*
     * 图形界面
     */ 
    var ui = {

        init: function() {
            this.topbar();
            this.preview();
            this.status();
        },

        topbar: function() {

            var webp = window.iSparta.webp,
                self = this;

            $config.on('change', function() {
                dataHelper.changeConfig($(this).val());
            })

            $ratio.on('change', function() {
                dataHelper.changeRatio($(this).val());
            })

            $savePath.on("change", function() {
                dataHelper.changeSavaPath($(this).val());
            })

            $btnSavePath.on("click", function() {
                $hSavePath.click();
            })

            $hSavePath.on("change", function(e) {
                var val = $(this).val();
                var opt = new Option(val, val);
                $(opt).attr("selected", "selected");
                $savePath[0].insertBefore(opt, $savePath[0].options[0])
                dataHelper.changeSavaPath(val);
            })

            $btnCov.click(function() {
                window.iSparta.webp.isStop = false;
                if($boxPreview.is(':empty') || $boxPreview.find('div').hasClass('empty')) {
                    window.iSparta.ui.showTips(i18n.__("No image selected"));
                }else {
                    webp.convert(webp.dirName);        
                }
            })

            $btnOpenSavePath.click(function() {
                gui.Shell.showItemInFolder($savePath.val());
            })
        },

        preview: function() {

            var webp = window.iSparta.webp;

            $("body").on("click", ".drag_area", function(){
                $hPath.click();
            });

            $hPath.on("change", function(e) {

                webp.isDir = true;
                var val = $(this).val();
                var opt = new Option(val, val);
                $(opt).attr("selected", "selected");
                $currentPath[0].insertBefore(opt, $currentPath[0].options[0]);
                dataHelper.changeCurrentPath(val);

                ui.fillImgDirList(val + path.sep);
                webp.dirName = val + path.sep;

                return false;
            });

            // 只有 DOM 才能获取 e 对象，所以需要转换
            $boxPreview[0].ondragover = function() {
                $dragArea.addClass("hover");
                return false;
            }

            $boxPreview[0].ondragleave = function() {
                $dragArea.removeClass("hover");
                return false;
            }

            $boxPreview[0].ondrop = function(e) {
                e.preventDefault();
                $dragArea.removeClass("hover");

                var fileList = e.dataTransfer.files; //获取文件对象
                // 目录
                if (fileList.length === 1 && fileList[0].path.lastIndexOf('.') === -1 ) {
                    webp.isDir = true;
                    var pathstr = fileList[0].path;
                    var opt = new Option(pathstr, pathstr);
                    $(opt).attr("selected", "selected");
                    
                    $currentPath[0].insertBefore(opt, $currentPath[0].options[0]);
                    dataHelper.changeCurrentPath(pathstr);

                    ui.fillImgDirList(pathstr + path.sep);
                    
                }

                // 拖曳文件
                else {
                    webp.isDir = false;
                    webp.fileList = fileList;

                    var pathstr = fileList[0].path.substring(0, fileList[0].path.lastIndexOf(path.sep));
                    var opt = new Option(pathstr, pathstr);
                    $(opt).attr("selected", "selected");

                    $currentPath[0].insertBefore(opt, $currentPath[0].options[0]);
                    dataHelper.changeCurrentPath(pathstr);

                    ui.fillImgList(fileList);
                }
                webp.dirName = pathstr + path.sep;
                return false;
            }
        },

        status: function() {

            var ui = this,
                webp = window.iSparta.webp;

            $currentPath.on("change", function() {
                webp.isDir = true;
                var options = webp.options;
                dataHelper.changeCurrentPath($(this).val());

                ui.fillImgDirList($(this).val() + path.sep);
                webp.dirName = $(this).val() + path.sep;

                return false;
            });

            $btnCurrentPath.on("click",function(){
                $hPath.click();
            });

            $refresh.on("click",function(){
                webp.isDir = true;
                var pathstr = $currentPath.val();
                ui.fillImgDirList(pathstr + path.sep);
                webp.dirName = pathstr + path.sep;
                
                return false;
            });

            $btnOpenPath.click(function() {
                gui.Shell.showItemInFolder($currentPath.val());
            });

            $currentLanguage.on('change', function() {
                var locale=$(this).val();
                window.iSparta.locale.changeLocale(locale);
            });
        },

        boxPreviewAppend: function(html) {
            if(!$boxPreview.is(':empty')) {
                $boxPreview.empty();
            }
            $boxPreview.append(html);
        },

        fillImgDirList: function(path) {
            if (!path) {
                return;
            }
            var webp = window.iSparta.webp,
                manager = fileManager;

            fs.readdir(path, function(err, files) {
                if (err) {
                    window.iSparta.window.iSparta.ui.showTips(i18n.__("Directory load failed! Please check whether the directory exists, disk letter is not allowd"));
                }else {
                    for (var i = 0; i < files.length; ++i) {
                        manager.readPicsAndGetSize(path + files[i]);
                    }
                    if (webp.o_dirSize === 0) {
                        window.iSparta.ui.showTips(i18n.__("Please select PNG or JPEG images"));
                    }
                }
            });
        },

        fillImgList: function(fileList) {
            if (!fileList) {
                return;
            }
            var webp = window.iSparta.webp,
                manager = fileManager;

            for(var i=0; i<fileList.length; i++){
                manager.readPicsAndGetSize(fileList[i].path);
            }
            if (webp.o_dirSize === 0) {
                window.iSparta.ui.showTips(i18n.__("Please select PNG or JPEG images"));
            }
        }
    }



    /*
     * 数据管理
     */ 
    var dataHelper = {

        webp: window.iSparta.webp,

        changeConfig: function(config) {
            this.webp.options.config = config;
            localData.setJSON("webp", this.webp.options);
        },

        changeRatio: function(ratio) {
            this.webp.options.ratio = ratio;
            localData.setJSON("webp", this.webp.options);
        },

        changeSavaPath: function(savePath) {

            var theSavePath = this.webp.options.savePath,
                length = theSavePath.length,
                i;

            for (i=0; i<length; i++) {
                if(savePath === theSavePath[i]){
                    break;
                }
            }

            var index = $savePath[0].selectedIndex;

            if ((i != theSavePath.length) || savePath == "parent" || savePath == "self") {
                this.webp.options.savePathIndex = i;
                localData.setJSON("webp", this.webp.options);
            }
            else{
                if (theSavePath.length > 6) {
                    theSavePath.splice(4, 1);
                }
                var len = theSavePath.length;
                theSavePath.unshift(savePath);
                this.webp.options.savePathIndex = 0;

                localData.setJSON("webp", this.webp.options);
            }
        },

        changeCurrentPath: function(currentPath) {

            var theCurrentPath = this.webp.options.currentPath,
                length = theCurrentPath.length,
                i;

            if (currentPath instanceof Object) {

                for (i=0; i<length; i++) {
                    if(currentPath == theCurrentPath[i]){
                        break;
                    }
                }
                var index = $currentPath[0].selectedIndex;

                if (i != length) {
                    webp.options.currentPathIndex = i;
                    localData.setJSON("webp", webp.options);
                }
                else {
                    if (length > 4) {
                        theCurrentPath.splice(4, 1);
                    }
                    theCurrentPath.unshift(currentPath[0].path);
                    var len = length;
                    this.webp.options.currentPathIndex = 0;

                    localData.setJSON("webp", webp.options);
                }        
            }
            else {
                for (i=0; i<length; i++) {
                    if(currentPath == theCurrentPath[i]){
                        break;
                    }
                }
                var index = $currentPath[0].selectedIndex;

                if (i != length) {
                    this.webp.options.currentPathIndex = i;
                    localData.setJSON("webp", this.webp.options);
                }
                else {
                    if(length > 4){
                        theCurrentPath.splice(4, 1);
                    }
                    theCurrentPath.unshift(currentPath);
                    var len = length;
                    this.webp.options.currentPathIndex = len-i;
                    
                    localData.setJSON("webp", this.webp.options);
                }
            }
        }
    }




    /*
     * 文件管理
     */ 
    var fileManager = {
        readPicsAndGetSize: function(path) {
            var webp = window.iSparta.webp;
            webp.o_dirSize = 0;

            if(path.indexOf('.jpg') != -1 || path.indexOf('.png') != -1 || path.indexOf('.JPG') != -1){
                var stats = fs.statSync(path);
                if (stats) {
                    ui.boxPreviewAppend('<div class="thumbnail"><img src="'+path+'"></div>');
                    webp.o_dirSize += stats.size;
                }
            }
        },

        unique: function(arr) {
            var ret = []
            var hash = {}
     
            console.log('before:'+arr.length);
            for (var i=0; i<arr.length; i++) {
                var key = arr[i];
                if (hash[key] !== 1) {
                        ret.push(key);
                        hash[key] = 1;
                }
            }
            console.log('after:'+ret.length);
            delete hash;
            return ret.length;
        },

        getColorCount: function(id, srcstr) {
            var canvas = document.getElementById(id);
            var ctx = canvas.getContext('2d');

            var img = new Image();        // Create new Image object
            img.src = srcstr;             // Set source path
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
                var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                var arr = [];
                for (var i=0; i<imgData.data.length; i+=4) {
                        var r = imgData.data[i];
                        var g = imgData.data[i+1];
                        var b = imgData.data[i+2];
                        var a = imgData.data[i+3];
                        arr.push([r,g,b,a]);
                }
                return unique(arr);
            }
        }
    }


})(jQuery);