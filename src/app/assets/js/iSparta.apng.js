(function ($) {
	var exec = require('child_process').exec,
		os = require('os'),
		fs = require('fs-extra'),
		gui = require('nw.gui');
	var $loop=$("#apng_select_loop"),
		$rate=$("#apng_select_rate"),
		$quality=$("#apng_select_quality"),
		$savePath=$("#apng_select_savePath"),

		$currentPath=$("#apng_select_currentPath"),
		$btnCurrentPath=$("#apng_btn_currentPath"),
		$refresh=$("#apng_currentPath_refresh"),
		$btnSavePath=$("#apng_btn_savePath"),
		$hSavePath=$("#apng_savePath_hidden"),
		$hPath=$("#apng_path_hidden"),
		$btnCov=$("#apng_btn_cov"),
		$lastDelay=$("#apng_last_delay"),
		$btnClear=$("#apng_clear"),
		$dragArea=$("#pngToApng .drag_area"),
		$boxPreview=$("#pngToApng .box_preview"),
		
		$itemOpenPos=$("#pngToApng .imglist .icon-folder-open"),
		tmplFileList = $('#apng_tmpl_filelist').html();
	
	window.iSparta.apng ={
		options:{
			loop:0,
			rate:1,
			quality:60,
			savePath:["parent","self"],
			currentPath:[],
			otherFiles:[],
			mixListIndex:0,
			savePathIndex:0,
			currentPathIndex:0
		},
		defalueOptions:{},
		fileList:[],
		nums:0,
		index:0,
		isClose:false,
		mixIndex:0,
		apngData:"",
		init:function(){
			localData=window.iSparta.localData;
			this.defalueOptions=this.options;
			var options=localData.getJSON("apng");
			$.extend(this.options,options);

			// this.options.quality=-1;
			options=this.options;
			// console.log(options)
			
			$loop.val(options.loop);
			$rate.val(options.rate);
			$lastDelay.val(options.lastDelay);
			$quality.val(options.quality);


			for(var i=0;i<options.savePath.length;i++){
				if(options.savePath[i]=="parent"){
					var opt=new Option("上级目录",options.savePath[i]);
				}else if(options.savePath[i]=="self"){
					var opt=new Option("同级目录",options.savePath[i]);
				}else{
					var opt=new Option(options.savePath[i],options.savePath[i]);
				}
				
				if(i==options.savePathIndex){
					$(opt).attr("selected","selected");
				}
				$savePath[0].options.add(opt);
			}
			for(var i=0;i<options.currentPath.length;i++){
				var opt=new Option(options.currentPath[i],options.currentPath[i]);
				if(i==options.currentPathIndex){
					$(opt).attr("selected","selected");
					var fileList=[{path:options.currentPath[i]}];
					var otherFiles=[];
					if(options.currentPath[i].indexOf("转换列表")==0){

						fileList=[];
						for(var j=0;j<options.otherFiles.length;j++){
							if(options.currentPath[i]=="转换列表"+options.otherFiles[j].id){
								for(var k=0;k<options.otherFiles[j].path.length;k++){
									fileList.push({path:options.otherFiles[j].path[k]});
								}
							}
						}
					}
		
					if(!this.ui.fillImglist(fileList)){

						//window.iSparta.ui.showTips("目录读取失败！请确认文件目录是否存在");
					}
				}
				$currentPath[0].options.add(opt);
		        
			}
			this.ui.init();
		},
		switch:function(id){

			if(!this.fileList[0]){
				window.iSparta.ui.showTips("未选择任何图片！");
				return;
			}
			var files=this.fileList[0].files;
			if(this.nums==0){
	            for(var j=0;j<files.length;j++){
	            	if(files[j].selected==true){
	            		this.nums++;
	            	}
	            }
			}
			if(this.nums==0){
				window.iSparta.ui.showTips("未选择任何图片！");
			}else{
				
				if(!id){
					
            					
					id=0;
					
				}
				while(files[id]){
					if(files[id].selected==true){
						break;
					}
					id++;
				}
				
				if(id<files.length&&this.isClose==false){
					var progress=(this.index+1)/this.nums;
		
					window.iSparta.ui.showProgress(progress,"正在处理第"+(this.index+1)+"张(共"+this.nums+"张)图片",function(){
						window.iSparta.apng.isClose=true;
					});
					this.index++;
					this.exec(id);
				}else{
					
					var filesInfo=window.iSparta.apng.fileList[0].files;
					
					var Allinfo=[];
					var postData=[];
					for(var i=0;i<filesInfo.length;i++){
						if(filesInfo[i].selected==true){
							var info={};
							info.name=filesInfo[i].name;
							info.beforesize=filesInfo[i].allPngSize;
							info.aftersize=filesInfo[i].apngsize;

							info.num=filesInfo[i].url.length;
							Allinfo.push(info);
						}
					}
					for(var i=0;i<this.index;i++){
						postData[i]=Allinfo[i];
					}
					
					window.iSparta.postData(postData,"apng");
					this.nums=0;
					this.index=0;
					this.isClose=false;
					window.iSparta.ui.hideProgress();
					window.iSparta.ui.hideLoading();
				}
			}
			

		},
		exec:function(id){
			var self=this;
   			var loop=this.options.loop;
			var rate=this.options.rate;
			var quality=this.options.quality;
			var savePath=this.options.savePath[this.options.savePathIndex];
			var files=this.fileList[0].files;
			var url=files[id].url[0];
			var urls=files[id].url;
            var name=files[id].name;
            var apngData;
            var framesData;
            var path=savePath+window.iSparta.sep+name+".png";
            var saveDir=savePath+window.iSparta.sep;
            if(savePath=="parent"){
            	var path=files[id].pppath+window.iSparta.sep+name+".png";
            	saveDir=files[id].pppath+window.iSparta.sep;
            }else if(savePath=="self"){
            	var path=files[id].ppath+window.iSparta.sep+name+".png";
            	saveDir=files[id].ppath+window.iSparta.sep;
            }
            saveDir=window.iSparta.handlePath(saveDir);
            path=window.iSparta.handlePath(path);
            
            var apngasm = process.cwd() + '/app/libs/apng/'+iSparta.getOsInfo()+'/apngasm';
            var pngquant = process.cwd() + '/app/libs/pngloss/'+iSparta.getOsInfo()+'/pngquant';
            var apngopt = process.cwd() + '/app/libs/apng/'+iSparta.getOsInfo()+'/apngopt';
           
            var tempdir=os.tmpdir()+'iSparta/';
            if(os.tmpdir().lastIndexOf(window.iSparta.sep)!=os.tmpdir().length-1){
            	tempdir=os.tmpdir()+'/iSparta/';
            }
            tempdir=window.iSparta.handlePath(tempdir);
            apngasm=window.iSparta.handlePath(apngasm);
            pngquant=window.iSparta.handlePath(pngquant);
            apngopt=window.iSparta.handlePath(apngopt);
           	var tempindex=0;
           	var quantindex=0;
           	try{
	           	dirHandle();
	           }
			catch(err){
				dirHandle();
			}
			function dirHandle(){
				fs.removeSync(tempdir);
	            fs.mkdirsSync(tempdir);
				for(var i=0;i<urls.length;i++){
					fs.copy(urls[i], tempdir+'apng'+(i+1)+'.png', function(err){
					  tempindex++;
					  
					 if(tempindex==urls.length){
					 	apngasmExec();
					 }
					});
				}
			};
			function pngquantExec(tempindex,len,framesData){
 				var quanturl=tempdir+'frame'+(tempindex)+'.png';
				//var quanturl2=tempdir+'apng_new'+(tempindex)+'.png';
				var quality=self.options.quality;
				
				quality=(quality-10)+"-"+quality;
				var quanttxt='"'+pngquant+'" --force  --quality '+quality+'  --ext .png "'+quanturl+'"';

				exec(quanttxt, {timeout: 1000000}, function(e){

					quantindex++;
					if(quantindex==urls.length){
						readFramesFiles(1,len,framesData);
			  			
			  		}else{
			  			pngquantExec(tempindex+1,len);
			  		}
				});
			};
			function readFramesFiles(readnum,len){
				fs.readFile(tempdir+"frame"+readnum+".png", function(err, data){
					
					if (err) throw err;
					var imgData="";
					for(var i=0;i<data.length;i++){
						imgData+=String.fromCharCode(data[i]);
					}

			 		if(readnum==len){

			 			framesData[readnum-1].img.src="data:image/png;base64," + btoa(imgData);
			 			framesData[readnum-1].img.data=imgData;
			 			setTimeout(function(){
			 			var afterData=window.iSparta.apng.format.formatFrames(framesData[0].width,framesData[0].height,framesData);
			 			var writeNum=0;
			 			for(var i=0;i<afterData.length;i++){

			 				var base64Data = afterData[i].replace(/^data:image\/\w+;base64,/, "");
								
							var dataBuffer = new Buffer(base64Data, 'base64');

			 				fs.writeFile(tempdir+"frame-loss"+(i+1)+".png",dataBuffer, function(err){
								if(err) throw err;

						        writeNum++;
						        if(writeNum==afterData.length){

						        	apngasmExecFinal();
						        }
							 })
			 			}
			 			},10)
			 			
			 		}else{
			 			framesData[readnum-1].img.src="data:image/png;base64," + btoa(imgData);
			 			framesData[readnum-1].img.data=imgData;
			 			readFramesFiles(readnum+1,len);
			 		}
				  	
				});
			};
			
			function apngasmExec(){
				//var url=tempdir+'apng_new1.png';
				rate=self.options.rate*100;
				var tempPath=tempdir+"apngout.png";
				// console.log('"'+apngasm+'" "'+tempPath+'" "'+tempdir+'apng1.png'+'" '+rate+" 100"+" /l"+loop)
				exec('"'+apngasm+'" "'+tempPath+'" "'+tempdir+'apng1.png'+'" '+rate+" 100"+" /l"+loop, {timeout: 1000000}, function(e){
	               // exec('"'+apngopt+'" "'+tempPath+'" "'+tempPath+'"', {timeout: 10000}, function(e){

	                	if(e) throw e;
	                	
	                	if(quality!=-1){
		                	fs.readFile(tempPath, function (err, data) {
								if (err) throw err;
								var PNG_SIGNATURE = String.fromCharCode(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
								var imgData="";
								for(var i=0;i<data.length;i++){
									imgData+=String.fromCharCode(data[i]);
								}
								window.iSparta.apng.apngData=imgData;
								framesData=null;

								framesData=window.iSparta.apng.format.parsePNGData(imgData,true);

								var writeNum=0;

								for(var i=0;i<framesData.length;i++){
									
									var base64Data = framesData[i].img.src.replace(/^data:image\/\w+;base64,/, "");
									
									var dataBuffer = new Buffer(base64Data, 'base64');
									var num=i+1;

									 fs.writeFile(tempdir+"frame"+num+".png", dataBuffer, function(err){
										if(err) throw err;
								        writeNum++;
								        if(writeNum==framesData.length){
								            pngquantExec(1,writeNum,framesData);
								         	
								        }
									 });
								}
							});
						  
						}else{
							fs.copy(tempPath,path, function(err){
				 				if(err) throw err;
								var size = fs.statSync(path).size;
			                	files[id].apngsize = size;
			                    window.iSparta.apng.switch(id+1);
		                    });
						}
	                	
	            });
			}
			function apngasmExecFinal(){
				var rate=self.options.rate*100;
				
				var tempPath=tempdir+"apngout.png";
				
				var lossPath=saveDir+name+'.png';
				exec('"'+apngasm+'" "'+lossPath+'" "'+tempdir+'frame-loss1.png'+'" '+rate+" 100"+" /l"+loop, {timeout: 1000000}, function(e){
	               // exec('"'+apngopt+'" "'+tempPath+'" "'+tempPath+'"', {timeout: 10000}, function(e){
					
						var size = fs.statSync(lossPath).size;
	                	files[id].apngsize = size;
	                    window.iSparta.apng.switch(id+1);								
						  
						//}	               	
	               	
	               	
	               // });
	            });
			}

		}
	};
	// 界面操作
	var DataBuilder = function() {
        this.parts = [];
    };
    DataBuilder.prototype.append = function(data) {
        this.parts.push(data);
    };
    DataBuilder.prototype.getUrl = function(contentType) {
        //if (global.btoa) {
            return "data:" + contentType + ";base64," + btoa(this.parts.join(""));
        //} else { // IE
          //  return "data:" + contentType + "," + escape(this.parts.join(""));
        //}
    };
    DataBuilder.prototype.getStr= function() {
  
    	return this.parts.join("");
        
    };
    (function() {
	    var
	            global = (function(){ return this; })(),
	            table = new Array(256);

	    for(var i=0; i<256; i++) {
	        var c=i;
	        for (var k=0; k<8; k++) c = (c&1) ? 0xEDB88320 ^ (c>>>1) : c>>>1;
	        table[i] = c;
	    }

	    global.crc32 = function(str) {
	        var crc = -1;
	        for( var i = 0, l = str.length; i < l; i++ )
	            crc = ( crc >>> 8 ) ^ table[( crc ^ str.charCodeAt( i ) ) & 0xFF];
	        return crc ^ (-1);
	    };
	})();
	window.iSparta.apng.format={
		frames:[],
		fcTLData:[],
		
		PNG_SIGNATURE:String.fromCharCode(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a),
		parsePNGData: function(imageData,story) {
            if (imageData.substr(0, 8) != this.PNG_SIGNATURE) {
                
                return false;
            }
            this.frames=[];
            if(story){
            	this.fcTLData=[];
            }
            
            var headerData, preData = "", postData = "", isAnimated = false;
            var off = 8, frame = null;
            var framesData=[];

            var plte="";
            var trns="";

            do {
                var length = this.readDWord(imageData.substr(off, 4));
                var type = imageData.substr(off + 4, 4);
                var data;
                
                switch (type) {
                    case "IHDR":
                        data = imageData.substr(off + 8, length);
                        headerData = data;
                        this.width = this.readDWord(data.substr(0, 4));
                        this.height = this.readDWord(data.substr(4, 4));
                       	
                        break;
                    case "acTL":
                        isAnimated = true;
                        this.numPlays = this.readDWord(imageData.substr(off + 8 + 4, 4));
                        break;
                    case "PLTE":
                    	plte = imageData.substr(off + 8, length);
                    	break;
                    case "tRNS":
                    	trns = imageData.substr(off + 8, length);
                    	break;
                    case "fcTL":
                    	
                        if (frame) this.frames.push(frame);
                        data = imageData.substr(off + 8, length);
                        if(story){
                        	this.fcTLData.push(data);
                        }
                        frame = {};

                        frame.sequence_number = this.readDWord(data.substr(0, 4));

                        frame.width     = this.readDWord(data.substr(4, 4));
                        frame.height    = this.readDWord(data.substr(8, 4));
                        frame.left      = this.readDWord(data.substr(12, 4));
                        frame.top       = this.readDWord(data.substr(16, 4));

                        var delayN      = this.readWord(data.substr(20, 2));
                        var delayD      = this.readWord(data.substr(22, 2));
                        if (delayD == 0) delayD = 100;
                        frame.delay = 1000 * delayN / delayD;
                        
                        if (frame.delay <= 10) frame.delay = 100;
                        this.playTime += frame.delay;

                        frame.disposeOp = data.charCodeAt(24);
                        
                        frame.blendOp   = data.charCodeAt(25);
                        frame.dataParts = [];
                       // console.log(frame)

                        break;
                    case "fdAT":
                    	var sequence_number = this.readDWord(imageData.substr(off+8, 4));
                    	
                        if (frame) frame.dataParts.push(imageData.substr(off + 8 + 4, length - 4));

                        break;
                    case "IDAT":
                        if (frame) frame.dataParts.push(imageData.substr(off + 8, length));
                        break;
                    case "IEND":
                        postData = imageData.substr(off, length + 12);
                        break;
                    default:

                        preData += imageData.substr(off, length + 12);
                }
                off += 12 + length;
            } while(type != "IEND" && off < imageData.length);
            if (frame) this.frames.push(frame);

            var loadedImages = 0, self = this;
           
            for (var i = 0; i < this.frames.length; i++) {
                var img = new Image();
                frame = this.frames[i];
                frame.img = img;
                
                var db = new DataBuilder();
                db.append(this.PNG_SIGNATURE);
                headerData = this.writeDWord(frame.width) + this.writeDWord(frame.height) + headerData.substr(8);
                
                db.append(this.writeChunk("IHDR", headerData));

                if(plte){
                	db.append(this.writeChunk("PLTE", plte));
                }
                if(trns){
                	db.append(this.writeChunk("tRNS", trns));
                }
                
            	
                for (var j = 0; j < frame.dataParts.length; j++)
                    db.append(this.writeChunk("IDAT", frame.dataParts[j]));
                db.append(postData);

                img.src = db.getUrl("image/png");
                
                img.data=db.getStr();
                framesData.push(img.src);
                delete frame.dataParts;
            }
            return this.frames;
        },
        
        readDWord:function(data) {
	        var x = 0;
	        for (var i = 0; i < 4; i++) x += (data.charCodeAt(i) << ((3 - i) * 8));
	        return x;
		},

		readWord:function(data) {
			var x = 0;
			for (var i = 0; i < 2; i++) x += (data.charCodeAt(i) << ((1 - i) * 8));
			return x;
		},

		writeChunk:function(type, data) {
			var res = "";
			res += this.writeDWord(data.length);
			res += type;
			res += data;
			res += this.writeDWord(crc32(type + data));

			return res;
		},
		writefdATChunk:function(type, data,num) {
			var res = "";
			res += this.writeDWord(data.length+4);
			res += type;
			res += this.writeDWord(num);
			res += data;
			res += this.writeDWord(crc32(type +this.writeDWord(num)+ data));
			return res;
		},

		writeDWord:function(num) {
			return String.fromCharCode(
			        ((num >> 24) & 0xff),
			        ((num >> 16) & 0xff),
			        ((num >> 8) & 0xff),
			        (num & 0xff)
			);
		},
        formatFrames:function(width,height,frames) {
        
        	var context=null,
				fNum = 0,
	        	prevF = null,
	        	afterImgData=[];
            var canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            var context = canvas.getContext("2d");

            for(var fNum=0;fNum<frames.length;fNum++){
            	var frame = this.frames[fNum];

            	if (fNum == 0) {
	                if (frame.disposeOp == 2) frame.disposeOp = 1;
	            }
	          
	            if (prevF && prevF.disposeOp == 1) {
	            	context.clearRect(prevF.left, prevF.top, prevF.width, prevF.height);
	            } else if (prevF && prevF.disposeOp == 2) {
	            	
	            	context.putImageData(prevF.iData,prevF.left, prevF.top);
	            }
	            prevF = frame;

	            prevF.iData = null;
	            if (prevF.disposeOp == 2) {
	                prevF.iData = context.getImageData(frame.left, frame.top, frame.width, frame.height);
	            }
	            if (frame.blendOp == 0){
					context.clearRect(frame.left, frame.top, frame.width, frame.height);
	 			}
	 			
	 			context.drawImage(frame.img, frame.left,frame.top);

	 			afterImgData.push(canvas.toDataURL("image/png"));
	 			// afterImgData.push(context.getImageData(0,0,width,height));
            }
            return afterImgData;
            
        }
	};
	window.iSparta.apng.ui={
		dataHelper:{},
		init:function(){
			this.dataHelper=window.iSparta.apng.dataHelper;
			this.topbar();
			this.preview();
			this.items();
			this.status();
		},
		topbar:function(){
			var ui=this;
			$loop.on("change",function(){
				ui.dataHelper.changeLoop($(this).val());
			});
			$quality.on("change",function(){
				ui.dataHelper.changeQuality($(this).val());
			});
			$rate.on("change",function(){
				ui.dataHelper.changeRate($(this).val());
			});
			$savePath.on("change",function(){
				ui.dataHelper.changeSavaPath($(this).val());
			});
			$btnSavePath.on("click",function(){
				$hSavePath.click();
			});
			$hSavePath.on("change",function(e){

				var val=$(this).val();
				var opt=new Option(val,val);
				$(opt).attr("selected","selected");
				$savePath[0].insertBefore(opt,$savePath[0].options[0])
				//$savePath[0].options.add(opt);
				ui.dataHelper.changeSavaPath(val);
			});
			$btnCov.on("click",function(){
				window.iSparta.apng.switch();
			});
		},
		preview:function(){
			var ui=this;
			$boxPreview[0].ondragover = function() { 
				$dragArea.addClass("hover");
				return false;
			};

			$boxPreview[0].ondragleave = function(e) { 
				$dragArea.removeClass("hover");
				return false;
			};
			$boxPreview[0].ondrop = function(e) {
				var apng=window.iSparta.apng;
				e.preventDefault();
				$dragArea.removeClass("hover");
				e.preventDefault(); //取消默认浏览器拖拽效果
		        var otherFiles = e.dataTransfer.files; //获取文件对象
		        apng.options.mixListIndex++;
		        var mixIndex=apng.options.mixListIndex;
		        //var opt=new Option(fileList[0].path,fileList[0].path);
		        var v=ui.fillImglist(otherFiles);
		        if(v){
			        var fileList="转换列表"+mixIndex;
			        var opt=new Option("转换列表"+mixIndex,"转换列表"+mixIndex);
			        $(opt).attr("selected","selected");
					$currentPath[0].insertBefore(opt,$currentPath[0].options[0]);
		        	ui.dataHelper.changeCurrentPath(fileList,otherFiles);
		        }
		        
				return false;
			};
			$dragArea.click(function(e) {
				$hPath.click();
				return false;
			});
			$hPath.on("change",function(e){
				var fileList = e.delegateTarget.files; //获取文件对象
				
				
				var val=$(this).val();
				if(ui.fillImglist(fileList)){
					var opt=new Option(val,val);
					$(opt).attr("selected","selected");
					$currentPath[0].insertBefore(opt,$currentPath[0].options[0]);
		        	ui.dataHelper.changeCurrentPath(val);
		        }
		        
				return false;
			});
		},
		fillImglist:function(fileList){
			if(fileList.length == 0){
	            return false;
	        }
	        window.iSparta.ui.showLoading();

	        if(!window.iSparta.apng.fileManager.walk(fileList,function(){})){
	        	window.iSparta.ui.hideLoading();
	        	window.iSparta.ui.showTips("目录读取失败！请确认文件目录是否存在！<br/>并且不能选择盘符！");
	        	return false;

	        };
	       	window.iSparta.ui.hideLoading();

	        var datas={};
	        var fileList=window.iSparta.apng.fileList;
	        
	        var delIndex=[];

	        for(var i=0;i<fileList.length;i++){
	        	
	        	for(var j=0;j<fileList[i].files.length;j++){
	        		
					if(fileList[i].files[j].url.length<2){
						var temp=[i,j]
		        		delIndex.push(temp);
		        	}
	        	}
	        	
	        }
	        for(var i=0;i<delIndex.length;i++){
	        	
	        	fileList[delIndex[i][0]].files.splice(delIndex[i][1]-i,1);
	        }
	        window.iSparta.apng.fileList=fileList;
	        datas.all=window.iSparta.apng.fileList;
	       
	        if(datas.all.length==0){
	        	window.iSparta.ui.showTips("文件名需序列化！");
	        	return false;
	        }else{
	        	
	        	var doTtmpl = doT.template(tmplFileList);
	        	var html=doTtmpl(datas);
	        	$boxPreview.html(html);
	        	return true;
	        }
	        
		},
		clear:function(fileList){
			if(fileList.length == 0){
	            return false;
	        }
	        window.iSparta.ui.showLoading();

	        if(!window.iSparta.apng.fileManager.walk(fileList,function(){})){
	        	window.iSparta.ui.hideLoading();
	        	window.iSparta.ui.showTips("目录读取失败！请确认文件目录是否存在！<br/>并且不能选择盘符！");
	        	return false;

	        };
	       	window.iSparta.ui.hideLoading();

	        var datas={};
	        var fileList=window.iSparta.apng.fileList;
	        
	        var delIndex=[];

	        for(var i=0;i<fileList.length;i++){
	        	
	        	for(var j=0;j<fileList[i].files.length;j++){
	        		
					if(fileList[i].files[j].url.length<2){
						var temp=[i,j]
		        		delIndex.push(temp);
		        	}
	        	}
	        	
	        }
	        for(var i=0;i<delIndex.length;i++){
	        	
	        	fileList[delIndex[i][0]].files.splice(delIndex[i][1]-i,1);
	        }
	        window.iSparta.apng.fileList=fileList;
	        datas.all=window.iSparta.apng.fileList;
	       
	        if(datas.all.length==0){
	        	window.iSparta.ui.showTips("文件名需序列化！");
	        	return false;
	        }else{
	        	
	        	var doTtmpl = doT.template(tmplFileList);
	        	var html=doTtmpl(datas);
	        	$boxPreview.html(html);
	        	return true;
	        }
	        
		},		
		items:function(){
			var timer=null;
			var ui=this;
			var urlIndex=0;
			$boxPreview.on("click",".imglist .thumb",function(){
				var fileList=window.iSparta.apng.fileList;
		        var li=$(this).closest("li");
		        var pid=li.attr("data-pid");
		        var id=li.attr("data-id");
		        li.toggleClass("checked");
		        if(li.hasClass("checked")){
		            fileList[pid].files[id].selected=true;
		        }else{
		            fileList[pid].files[id].selected=false;
		        }
		    });

		    $boxPreview.on("mouseover",".imglist .thumb",function(){
		    	var fileList=window.iSparta.apng.fileList;
		    	var li=$(this).closest("li");
		        var pid=li.attr("data-pid");
		        var id=li.attr("data-id");
				
				var that=$(this);
				
				timer=setInterval(function(){
					if(urlIndex>fileList[pid].files[id].url.length-1){
						urlIndex=0;
					}
					that.find("img").attr("src",fileList[pid].files[id].url[urlIndex]);
					urlIndex++;
				},window.iSparta.apng.options.rate*1000);
		    });
		    $boxPreview.on("mouseout",".imglist .thumb",function(){
		    	var fileList=window.iSparta.apng.fileList;
		    	var li=$(this).closest("li");
		        var pid=li.attr("data-pid");
		        var id=li.attr("data-id");
		    	clearInterval(timer);
		    	$(this).find("img").attr("src",fileList[pid].files[id].url[0]);
		    });
		    $boxPreview.on("click",".imglist .icon-folder-open",function(){
		        var url=$(this).attr("data-href");
		        gui.Shell.showItemInFolder(url);
		    });
		    $boxPreview.on("blur",".imglist input[type='text']",function(){
		        var name=$(this).val();
		        var fileList=window.iSparta.apng.fileList;
		    	var li=$(this).closest("li");
		        var pid=li.attr("data-pid");
		        var id=li.attr("data-id");
		        fileList[pid].files[id].name=name;
		    });
		},
		status:function(){
			var ui=this;
			$currentPath.on("change",function(){
				var options=window.iSparta.apng.options;
				var path=$(this).val();

				if(path.indexOf("转换列表")==0){
					var fileList=[];
					for(var j=0;j<options.otherFiles.length;j++){

						if(path=="转换列表"+options.otherFiles[j].id){
							for(var k=0;k<options.otherFiles[j].path.length;k++){
								fileList.push({path:options.otherFiles[j].path[k]});
							}
						}
					}
				}else{
					var fileList=[{path:path}];
				}
				ui.dataHelper.changeCurrentPath($(this).val());
				ui.fillImglist(fileList);
				

			});
			$btnCurrentPath.on("click",function(){
				$hPath.click();
			});
			$btnClear.on("click",function(){
				window.iSparta.apng.options=window.iSparta.apng.defalueOptions;
				window.iSparta.localData.remove("apng");
				ui.clear(fileList);
			});
			$refresh.on("click",function(){
				var path=$currentPath.val();
				var options=window.iSparta.apng.options;
				if(path.indexOf("转换列表")==0){
					var fileList=[];
					for(var j=0;j<options.otherFiles.length;j++){

						if(path=="转换列表"+options.otherFiles[j].id){
							for(var k=0;k<options.otherFiles[j].path.length;k++){
								fileList.push({path:options.otherFiles[j].path[k]});
							}
						}
					}
				}else{
					var fileList=[{path:path}];
				}		
				ui.fillImglist(fileList);		
				return false;
			});

		}
	};
	// 数据控制
	window.iSparta.apng.dataHelper={
		changeLoop:function(loop){
			var apng=window.iSparta.apng;
			apng.options.loop=loop;
			window.iSparta.localData.setJSON("apng",apng.options);
		},
		changeQuality:function(quality){
			var apng=window.iSparta.apng;
			apng.options.quality=quality;
			
			window.iSparta.localData.setJSON("apng",apng.options);
		},
		changeRate:function(rate){
			var apng=window.iSparta.apng;
			apng.options.rate=rate;
			window.iSparta.localData.setJSON("apng",apng.options);
		},
		changeSavaPath:function(savePath){
			var apng=window.iSparta.apng;
			var theSavePath=apng.options.savePath;
			for(var i=0;i<theSavePath.length;i++){
				if(savePath==theSavePath[i]){
					break;
				}
			}

			var index=$savePath[0].selectedIndex;
			if((i!=theSavePath.length)||savePath=="parent"||savePath=="self"){
				apng.options.savePathIndex=i;
				window.iSparta.localData.setJSON("apng",apng.options);
			}else{
				if(apng.options.savePath.length>6){
					apng.options.savePath.splice(4,1);
				}
				var len=apng.options.savePath.length;
				apng.options.savePath.unshift(savePath);
				apng.options.savePathIndex=0;
				window.iSparta.localData.setJSON("apng",apng.options);
			}
			
		},
		changeCurrentPath:function(currentPath,theOtherFiles){
			var apng=window.iSparta.apng;
			var theCurrentPath=apng.options.currentPath;
			
			if(currentPath.indexOf("转换列表")==0){
				for(var i=0;i<theCurrentPath.length;i++){
					if(currentPath==theCurrentPath[i]){
						break;
					}
				}
				var index=$currentPath[0].selectedIndex;
				if(i!=theCurrentPath.length){
					apng.options.currentPathIndex=i;
					window.iSparta.localData.setJSON("apng",apng.options);
				}else{
					if(apng.options.currentPath.length>4){
						apng.options.currentPath.splice(4,1);
					}
					apng.options.currentPath.unshift(currentPath);
					var len=apng.options.currentPath.length;
					apng.options.currentPathIndex=0;
					var otherFiles={id:apng.options.mixListIndex,path:[]};
					for(var i=0;i<theOtherFiles.length;i++){
						otherFiles.path.push(theOtherFiles[i].path);
					}
					
					apng.options.otherFiles.push(otherFiles);
					
					window.iSparta.localData.setJSON("apng",apng.options);
				}
			}else{
				for(var i=0;i<theCurrentPath.length;i++){
					if(currentPath==theCurrentPath[i]){
						break;
					}
				}
				var index=$currentPath[0].selectedIndex;
				if(i!=theCurrentPath.length){
					apng.options.currentPathIndex=i;
					window.iSparta.localData.setJSON("apng",apng.options);
				}else{
					if(apng.options.currentPath.length>4){
						apng.options.currentPath.splice(4,1);
					}
					apng.options.currentPath.unshift(currentPath);
					var len=apng.options.currentPath.length;
					apng.options.currentPathIndex=len-i+1;
					
					window.iSparta.localData.setJSON("apng",apng.options);
				}
			}
			
		}
	};
	// 文件目录递归与操作
	window.iSparta.apng.fileManager={
	    length:-1,
	    nowLen:0,
	    names:[],
	    allsize:0,
	    maxDepth:3,
	    nowDepth:0,
	    Apng:{},
	    walk:function(fileList,callback){
	        // 一次只拉一个文件夹
	       	var Apng=this.Apng;
	        this.length=0;
	        Apng.fileList=[];
	        this.names=[];
	        if(fileList[0].path.length==3){
	        	return false;
	        }
	        for(var i=0;i<fileList.length;i++){
	        	
	            var path=fileList[i].path;
	            
	           	if(!fs.existsSync(path)){
	           		// console.log(fs.existsSync(path))
	           		return false;
	           	}
	           	this.nowDepth=-1;
	            if(fs.statSync(path).isDirectory()){
	            	this.nowDepth++;
	            	var dirs={};
	                var url=path.substring(0,path.lastIndexOf(window.iSparta.sep));
	                dirs.url=url;
	                dirs.length=this.length+i;
	                dirs.files=[];
	                Apng.fileList.push(dirs);
	                this.walkDir(path);
	                //fileWalk.length++;
	            }else if(fs.statSync(path).isFile()){
	                var url=path.substring(0,path.lastIndexOf(window.iSparta.sep));
	                var dirs={};
	                
	                //if(fileWalk.length==0||url!=fileWalk.allFileList[fileWalk.length].url){
	                    dirs.url=url;
	                    dirs.files=[];
	                    if(this.nowLen!=this.length||(this.length==0&&(!Apng.fileList[this.length]||url!=Apng.fileList[this.length].url))){
	                        Apng.fileList.push(dirs);
	                    }
	                    if(this.nowLen!=this.length){
	                        this.nowLen=this.length
	                    }
	                    this.walkFile(path);
	                    //return ;
	               // }
	                //fileWalk.walkFile(path);

	            }
	            
	            
	        }
	        this.nowDepth=-1;
	        var len=Apng.fileList.length;
	        var listTemp=Apng.fileList;
	        for(var i=len-1;i>=0;i--){
	            var len2=Apng.fileList.length;
	            if(Apng.fileList[i].files.length==0){
	                
	                Apng.fileList.splice(len2-1,1);
	               
	            }
	        }
	        window.iSparta.apng.fileList=Apng.fileList;
	        if((typeof callback)=='function'){
	        	callback();
	        }
	        return true;
	    },
	    walkFile:function(path){
	        //var apng={name:name};
	         var Apng=this.Apng;
	        if(/.*\d+\.png$/i.test(path)){
	            //apng.frames.push(path);
	            var url=path;
	            var repeatIndex=-1;
	           
	            var allfile=Apng.fileList[this.length].files;
	            var stat=fs.statSync(path);
	            var size=stat.size;
	            path2=path;
	            path=path.replace(/\d+\.png$/i,"");
	            
	            var ppath=path.substring(0,path.lastIndexOf(window.iSparta.sep));
	            var pppath=ppath.substring(0,ppath.lastIndexOf(window.iSparta.sep));
	            var name=path.substring(path.lastIndexOf(window.iSparta.sep)+1,path.length);
	            if(name.length<2){
	                name=path.substring(0,path.lastIndexOf(window.iSparta.sep));
	                name=name.substring(name.lastIndexOf(window.iSparta.sep)+1,name.length);
	            }
	            var index=0;
	            for(var i=0;i<this.names.length;i++){
	                if(name==this.names[i]){
	                    
	                    var name2=this.names[i].match(/(.*?)(\d+)$/i);

	                    if(name2){
	                        
	                        var num=parseInt(name2[2]);
	                        var pre=name2[1];
	                        if(num>index){
	                            num=num+1;
	                            name=pre+num;
	                        }
	                    }else{
	                         name=name+1;
	                    }
	                }
	            }
	            for(var i=0;i<allfile.length;i++){
	                if(path==allfile[i].path){
	                    repeatIndex=i;
	                }
	            }
	            if(allfile.length!=0&&repeatIndex!=-1){
	                allfile[repeatIndex].url.push(url);
	                allfile[repeatIndex].allPngSize+=size;

	            }else{
	                if(allfile.length!=0&&allfile[allfile.length-1].url.length==1){
	                    allfile.splice(allfile.length-1,1);
	                }
	                var file={path2:path,path:path,ppath:ppath,pppath:pppath,selected:true};
	                file.url=[];
	                
	                
	                file.name=name;
	                file.allPngSize=size;
	                this.names.push(name);
	                file.url.push(url);
	                allfile.push(file);
	                file.allPngSize=0;
	            }
	        }
	    },
	    walkDir:function(path){
	        var dirList = fs.readdirSync(path);
	        var that=this;
			that.nowDepth++;
	        dirList.forEach(function(item){
	        	
	            if(fs.statSync(path + window.iSparta.sep + item).isDirectory()){ 
	            	
	        		if(that.nowDepth<that.maxDepth){
	        			
	        			that.walkDir(path + window.iSparta.sep + item);

	        		}
	        		if(that.nowDepth>=that.maxDepth){
	        			
	        		
	        		}
	        		
					
	               
	            }else if(fs.statSync(path + window.iSparta.sep + item).isFile()){
	                that.walkFile(path + window.iSparta.sep + item);
	            }
	        });
	        that.nowDepth--;
	        
	    }
	}


})(jQuery);