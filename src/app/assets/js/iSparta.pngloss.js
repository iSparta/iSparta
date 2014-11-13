(function ($) {
	var exec = require('child_process').exec,
		os = require('os'),
		fs = require('fs-extra'),
		gui = require('nw.gui');
	var $savePath=$("#pngloss_select_savePath"),
		$currentPath=$("#pngloss_select_currentPath"),
		$ext=$("#pngloss_select_ext"),
		$quality=$("#pngloss_select_quality"),
		$colors=$("#pngloss_select_colors"),
		$iedebug=$("#pngloss_check_iedebug"),
		$btnCurrentPath=$("#pngloss_btn_currentPath"),
		$refresh=$("#pngloss_currentPath_refresh"),
		$btnSavePath=$("#pngloss_btn_savePath"),
		$hSavePath=$("#pngloss_savePath_hidden"),
		$hPath=$("#pngloss_path_hidden"),
		$btnCov=$("#pngloss_btn_cov"),
		$dragArea=$("#pngloss .drag_area"),
		$boxPreview=$("#pngloss .box_preview"),
		
		$itemOpenPos=$("#pngloss .imglist .icon-folder-open"),
		tmplFileList = $('#pngloss_tmpl_filelist').html();
	
	window.iSparta.pngloss ={
		options:{
			savePath:["self","parent"],
			currentPath:[],
			ext:"",
			colors:256,
			quality:"",
			otherFiles:[],
			mixListIndex:0,
			savePathIndex:0,
			currentPathIndex:0
		},
		fileList:[],
		nums:0,
		index:0,
		isClose:false,
		mixIndex:0,
		init:function(){
			localData=window.iSparta.localData;
			var options=localData.getJSON("pngloss");
			$.extend(this.options,options);
			
			options=this.options;
		
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
			var extoptions=$ext.find("option");
			
			//$(extoptions[0]).attr("selected","selected");
			for(var i=0;i<extoptions.length;i++){
				if(options.ext==$(extoptions[i]).val()){
					extoptions[i].selected=true;
				}
			}
			var qualityOptions=$quality.find("option");
			
			for(var i=0;i<qualityOptions.length;i++){
				if(options.quality==$(qualityOptions[i]).val()){
					qualityOptions[i].selected=true;
				}
			}
			var colorsOptions=$colors.find("option");
			for(var i=0;i<colorsOptions.length;i++){
				if(options.colors==$(colorsOptions[i]).val()){
					colorsOptions[i].selected=true;
				}
			}
			$iedebug[0].checked=false;
			if(options.iedebug==1){
				$iedebug[0].checked=true;
			}
			
			for(var i=0;i<options.currentPath.length;i++){
				var opt=new Option(options.currentPath[i],options.currentPath[i]);
				if(i==options.currentPathIndex){
					$(opt).attr("selected","selected");
					var fileList=[{path:options.currentPath[i]}];
					var otherFiles=[];
					if(options.currentPath[i].indexOf("压缩列表")==0){
						fileList=[];
						for(var j=0;j<options.otherFiles.length;j++){
							if(options.currentPath[i]=="压缩列表"+options.otherFiles[j].id){
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
						window.iSparta.pngloss.isClose=true;
					});
					this.index++;
					this.exec(id);
				}else{
					var filesInfo=window.iSparta.pngloss.fileList[0].files;
					var Allinfo=[];
					var postData=[];
					for(var i=0;i<filesInfo.length;i++){
						if(filesInfo[i].selected==true){
							var info={};
							info.name=filesInfo[i].name;
							info.beforesize=filesInfo[i].allSize;
							info.aftersize=filesInfo[i].pnglossSize;
							info.num=filesInfo[i].url.length;
							Allinfo.push(info);
						}
					}
					postData[0]={};
					postData[0].name=filesInfo[0].path;
					postData[0].num=Allinfo.length;
					postData[0].beforesize=0;
					postData[0].aftersize=0;
					for(var i=0;i<this.index;i++){
						postData[0].beforesize+=Allinfo[i].beforesize;
						postData[0].aftersize+=Allinfo[i].aftersize;
					}
					
					window.iSparta.postData(postData,"pngloss");
					this.nums=0;
					this.index=0;
					this.isClose=false;
					window.iSparta.ui.hideProgress();
					window.iSparta.ui.hideLoading();
				}
			}
			

		},
		exec:function(id){
			var savePath=this.options.savePath[this.options.savePathIndex];
			var files=this.fileList[0].files;
			var url=files[id].url[0];
			var urls=files[id].url;
            var name=files[id].name;
            var quality=this.options.quality;
            var colors=this.options.colors;
            var name2=files[id].name2;
            var ext=this.options.ext;
            var path=savePath+iSparta.sep+name+ext;
            var filename=name+ext;
           	
            if(savePath=="parent"){
            	var path=files[id].pppath+iSparta.sep+name+ext;
            }else if(savePath=="self"){
            	var path=files[id].ppath+iSparta.sep+name+ext;
            	
            }
            
            var type=name2.substring(name2.lastIndexOf(".")+1);
            path+="."+type;
            
            var pngquant = process.cwd() + '/app/libs/pngloss/'+iSparta.getOsInfo()+'/pngquant';
            pngquant=window.iSparta.handlePath(pngquant);

   //          name2=name2.replace(".gif","");
   //          var start=name2.indexOf(".");
   //          var end=name2.lastIndexOf(".");
   //          var nameTemp=name2.substr(0,start);
   //          var num=name2.substring(start+1,end)
   //         	num=parseInt(num)+1;
   //         	if(num<10){
   //         		num="0"+num;
   //         	}
   //         	var afterPath=savePath+iSparta.sep+nameTemp+"\\"+nameTemp+num+".png";
   //         	var afterDir=savePath+iSparta.sep+nameTemp+"\\";
   //         	console.log(afterDir)
   //         	if(!fs.existsSync(afterDir)){
   //         		fs.mkdirsSync(afterDir);
   //         	}
			// fs.copy(url, afterPath,function(){				
			// 	window.iSparta.pngloss.switch(id+1);
			// });  

       //      window.iSparta.pngloss.format.writeNumData(url,function(){
       //      	window.iSparta.pngloss.switch(id+1);
   			 // });
			fs.readFile(url, function (err, data) {
	   				
				if (err) throw err;
				var PNG_SIGNATURE = String.fromCharCode(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
				var imgData="";
				for(var i=0;i<data.length;i++){
					imgData+=String.fromCharCode(data[i]);
				}
				window.iSparta.pngloss.format.parsePNGData(imgData);
				
				pnglossExec();
			});            
			function pnglossExec(){
				//var url=tempdir+'pngloss_new1.png';
				var qualityOption=quality?'--quality '+(quality-10)+'-'+quality:"";
				if(savePath=="self"){
					var pngquantcomd='"'+pngquant+'" --force --iebug --ext '+ext+'.png '+qualityOption+' '+colors+' "'+url+'"';
				}else{
					var pngquantcomd='"'+pngquant+'" --force --iebug --ext -temp.png '+qualityOption+' '+colors+' "'+url+'"';
				}
				
				if(name.lastIndexOf("-loss")!=-1){
					window.iSparta.pngloss.switch(id+1);
					return;
				}
				// console.log(pngquantcomd)
				if(type.toLowerCase()=="png"){
					
					exec(pngquantcomd, {timeout: 1000000}, function(e){
						
						var afterPath="";
						if(savePath=="self"){
							
							window.iSparta.pngloss.format.writeNpData(path,function(){
								window.iSparta.pngloss.switch(id+1);
							});
						}else{
					
							fs.copy(files[id].ppath+window.iSparta.sep+name+"-temp.png", path,function(){
								
								setTimeout(function(){
									fs.delete(files[id].ppath+window.iSparta.sep+name+"-temp.png",function(){
										window.iSparta.pngloss.format.writeNpData(path,function(){
										
										
										window.iSparta.pngloss.switch(id+1);
										});									
									});									
								},10)
								
								
							});

						}
						
	            	});
	            	return;
				}
				
			}
			
			
		}
	};
	window.iSparta.pngloss.format={
		npTcData:"",
		PNG_SIGNATURE:String.fromCharCode(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a),
		parsePNGData: function(imageData) {
            if (imageData.substr(0, 8) != this.PNG_SIGNATURE) { 
                return false;
            }
            this.npTcData="";
            
            var off = 8, frame = null;
            do {
                var length = this.readDWord(imageData.substr(off, 4));
                var type = imageData.substr(off + 4, 4);
                var data;
                console.log(type)
                switch (type) {
                	case "acTL":
                	var num = this.readDWord(imageData.substr(off + 8 + 4, 4));
                	console.log(num)
                	break;
                    case "npTc":
                        this.npTcData+=imageData.substr(off + 8, length);
                        break;                    
                    default:
                        break;
                }
                off += 12 + length;
            } while(type != "IEND" && off < imageData.length);
            console.log(this.npTcData);
            return this.npTcData;
        },
        writeNpData:function(filepath,callback){
        	var self=this;
        
        	fs.readFile(filepath, function (err, data) {
        		
				if (err) throw err;
			
				var PNG_SIGNATURE = String.fromCharCode(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
				var imgData="";
				for(var i=0;i<data.length;i++){
					imgData+=String.fromCharCode(data[i]);
				}
				
				// console.log(self.PNG_SIGNATURE)
				if (imgData.substr(0, 8) != self.PNG_SIGNATURE) { 
	                return false;
	            }
	           
	            var pngtmp=imgData;
	            var off = 8, frame = null;
	            do {
	                var length = self.readDWord(imgData.substr(off, 4));
	                var type = imgData.substr(off + 4, 4);
	                var data;
	                
	                switch (type) {
	                    case "IHDR":
	                        var before=pngtmp.substring(0,off+length+12);
                    		var after=pngtmp.substring(off+length+12,pngtmp.length);
                    		var middle=self.writeChunk("npTc",self.npTcData);
                    		// var middle=self.npTcData;
                    		pngtmp=before+middle+after;
                    		finish=true;
	                        break;
	                    default:
	                        break;
	                }
	                off += 12 + length;
	            } while(type != "IEND" && off < imgData.length);
	            var base64Data=btoa(pngtmp);
				var dataBuffer = new Buffer(base64Data, 'base64');
				
				fs.writeFile(filepath, dataBuffer, function(err){
				 	if(err) throw err;
				 	// fs.copy(filepath, saveDir+name+'-loss.png', function(err){
				 		callback();
					  	
					// });
			        
				})
			
			});
        },
		writeNumData:function(filepath,callback){
        	var self=this;
        
        	fs.readFile(filepath, function (err, data) {
        		
				if (err) throw err;
			
				var PNG_SIGNATURE = String.fromCharCode(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
				var imgData="";
				for(var i=0;i<data.length;i++){
					imgData+=String.fromCharCode(data[i]);
				}
				
				// console.log(self.PNG_SIGNATURE)
				if (imgData.substr(0, 8) != self.PNG_SIGNATURE) { 
	                return false;
	            }
	           
	            var pngtmp=imgData;
	            var off = 8, frame = null;
	            do {
	                var length = self.readDWord(imgData.substr(off, 4));
	                var type = imgData.substr(off + 4, 4);
	                var data;
	                
	                switch (type) {
	                    case "acTL":
	                        var before=pngtmp.substring(0,off + 8 + 4);
                    		var after=pngtmp.substring(off + 8 + 8,pngtmp.length);
                    		var middle=self.writeDWord(0);
                    		// var middle=self.npTcData;
                    		pngtmp=before+middle+after;
                    		finish=true;
	                        break;
	                    default:
	                        break;
	                }
	                off += 12 + length;
	            } while(type != "IEND" && off < imgData.length);
	            var base64Data=btoa(pngtmp);
				var dataBuffer = new Buffer(base64Data, 'base64');
				
				fs.writeFile(filepath, dataBuffer, function(err){
				 	if(err) throw err;
				 	// fs.copy(filepath, saveDir+name+'-loss.png', function(err){
				 		callback();
					  	
					// });
			        
				})
			
			});
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
		writeDWord:function(num) {
			return String.fromCharCode(
			        ((num >> 24) & 0xff),
			        ((num >> 16) & 0xff),
			        ((num >> 8) & 0xff),
			        (num & 0xff)
			);
		}
	};
	// 界面操作
	window.iSparta.pngloss.ui={
		dataHelper:{},
		init:function(){
			this.dataHelper=window.iSparta.pngloss.dataHelper;
			this.topbar();
			this.preview();
			this.items();
			this.status();
		},
		topbar:function(){
			var ui=this;
			$savePath.on("change",function(){
				ui.dataHelper.changeSavaPath($(this).val());	
			});
			$ext.on("change",function(){
				ui.dataHelper.changeExt($(this).val());
			});
			$quality.on("change",function(){
				ui.dataHelper.changeQuality($(this).val());
			});
			$colors.on("change",function(){
				ui.dataHelper.changeColors($(this).val());
			});
			$iedebug.on("change",function(){
				var val=0;
				if($(this)[0].checked){
					val=1;
				}
				ui.dataHelper.changeIedebug(val);
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
				window.iSparta.pngloss.switch();
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
				var pngloss=window.iSparta.pngloss;
				e.preventDefault();
				$dragArea.removeClass("hover");
				e.preventDefault(); //取消默认浏览器拖拽效果
		        var otherFiles = e.dataTransfer.files; //获取文件对象
		        pngloss.options.mixListIndex++;
		        var mixIndex=pngloss.options.mixListIndex;
		        //var opt=new Option(fileList[0].path,fileList[0].path);
		        var v=ui.fillImglist(otherFiles);
		        if(v){
			        var fileList="压缩列表"+mixIndex;
			        var opt=new Option("压缩列表"+mixIndex,"压缩列表"+mixIndex);
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
	        window.iSparta.pngloss.fileList=window.iSparta.fileManager.walk(fileList,"png","-loss");
	        if(!window.iSparta.pngloss.fileList){

	        	window.iSparta.ui.hideLoading();
	        	window.iSparta.ui.showTips("目录读取失败！请确认文件目录是否存在！<br/>并且不能选择盘符！");
	        	
	        	return false;

	        };
	       	window.iSparta.ui.hideLoading();
	        var datas={};
	        datas.all=window.iSparta.pngloss.fileList;
	       
	        if(datas.all.length==0){
	        	window.iSparta.ui.showTips("请选择PNG图片！");
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
				var fileList=window.iSparta.pngloss.fileList;
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
		    	var fileList=window.iSparta.pngloss.fileList;
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
				},window.iSparta.pngloss.options.rate*1000);
		    });
		    $boxPreview.on("mouseout",".imglist .thumb",function(){
		    	var fileList=window.iSparta.pngloss.fileList;
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
		        var fileList=window.iSparta.pngloss.fileList;
		    	var li=$(this).closest("li");
		        var pid=li.attr("data-pid");
		        var id=li.attr("data-id");
		        fileList[pid].files[id].name=name;
		    });
		},
		status:function(){
			var ui=this;
			$currentPath.on("change",function(){
				var options=window.iSparta.pngloss.options;
				var path=$(this).val();

				if(path.indexOf("压缩列表")==0){
					var fileList=[];
					for(var j=0;j<options.otherFiles.length;j++){

						if(path=="压缩列表"+options.otherFiles[j].id){
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
			
			$refresh.on("click",function(){
				var path=$currentPath.val();
				var options=window.iSparta.pngloss.options;
				if(path.indexOf("压缩列表")==0){
					var fileList=[];
					for(var j=0;j<options.otherFiles.length;j++){

						if(path=="压缩列表"+options.otherFiles[j].id){
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
	window.iSparta.pngloss.dataHelper={
		changeLoop:function(loop){
			var pngloss=window.iSparta.pngloss;
			pngloss.options.loop=loop;
			window.iSparta.localData.setJSON("pngloss",pngloss.options);
		},
		changeRate:function(rate){
			var pngloss=window.iSparta.pngloss;
			pngloss.options.rate=rate;
			window.iSparta.localData.setJSON("pngloss",pngloss.options);
		},
		changeSavaPath:function(savePath){
			var pngloss=window.iSparta.pngloss;
			var theSavePath=pngloss.options.savePath;
			for(var i=0;i<theSavePath.length;i++){
				if(savePath==theSavePath[i]){
					break;
				}
			}

			var index=$savePath[0].selectedIndex;

			if((i!=theSavePath.length)||savePath=="parent"||savePath=="self"){

				pngloss.options.savePathIndex=i;
				window.iSparta.localData.setJSON("pngloss",pngloss.options);
			}else{
				if(pngloss.options.savePath.length>6){
					pngloss.options.savePath.splice(4,1);
				}
				var len=pngloss.options.savePath.length;
				pngloss.options.savePath.unshift(savePath);
				pngloss.options.savePathIndex=0;
				window.iSparta.localData.setJSON("pngloss",pngloss.options);
			}
			
		},
		changeExt:function(ext){
			var pngloss=window.iSparta.pngloss;	

			pngloss.options.ext=ext;
			
			window.iSparta.localData.setJSON("pngloss",pngloss.options);
			
		},changeQuality:function(quality){
			var pngloss=window.iSparta.pngloss;	

			pngloss.options.quality=quality;
			
			window.iSparta.localData.setJSON("pngloss",pngloss.options);
			
		},changeColors:function(colors){
			var pngloss=window.iSparta.pngloss;	

			pngloss.options.colors=colors;
			
			window.iSparta.localData.setJSON("pngloss",pngloss.options);
			
		},changeIedebug:function(iedebug){
			var pngloss=window.iSparta.pngloss;	

			pngloss.options.iedebug=iedebug;
			
			window.iSparta.localData.setJSON("pngloss",pngloss.options);
			
		},
		changeCurrentPath:function(currentPath,theOtherFiles){
			var pngloss=window.iSparta.pngloss;
			var theCurrentPath=pngloss.options.currentPath;
			if(currentPath.indexOf("压缩列表")==0){

				for(var i=0;i<theCurrentPath.length;i++){
					if(currentPath==theCurrentPath[i]){
						break;
					}
				}
				var index=$currentPath[0].selectedIndex;
				if(i!=theCurrentPath.length){
					pngloss.options.currentPathIndex=i;
					window.iSparta.localData.setJSON("pngloss",pngloss.options);
				}else{
					if(pngloss.options.currentPath.length>4){
						pngloss.options.currentPath.splice(4,1);
					}
					pngloss.options.currentPath.unshift(currentPath);
					var len=pngloss.options.currentPath.length;
					pngloss.options.currentPathIndex=0;
					var otherFiles={id:pngloss.options.mixListIndex,path:[]};
					console.log(theOtherFiles)
					for(var i=0;i<theOtherFiles.length;i++){
						otherFiles.path.push(theOtherFiles[i].path);
					}
					
					pngloss.options.otherFiles.push(otherFiles);
					
					window.iSparta.localData.setJSON("pngloss",pngloss.options);
				}
			}else{
				for(var i=0;i<theCurrentPath.length;i++){
					if(currentPath==theCurrentPath[i]){
						break;
					}
				}
				var index=$currentPath[0].selectedIndex;
				if(i!=theCurrentPath.length){
					pngloss.options.currentPathIndex=i;
					window.iSparta.localData.setJSON("pngloss",pngloss.options);
				}else{
					if(pngloss.options.currentPath.length>4){
						pngloss.options.currentPath.splice(4,1);
					}
					pngloss.options.currentPath.unshift(currentPath);
					var len=pngloss.options.currentPath.length;
					pngloss.options.currentPathIndex=len-i+1;
					
					window.iSparta.localData.setJSON("pngloss",pngloss.options);
				}
			}
			
		}
	};
	// 文件目录递归与操作
	


})(jQuery);