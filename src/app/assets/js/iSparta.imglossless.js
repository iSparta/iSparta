(function ($) {
	var exec = require('child_process').exec,
		os = require('os'),
		fs = require('fs-extra'),
		gui = require('nw.gui');
	var $savePath=$("#imglossless_select_savePath"),
		$currentPath=$("#imglossless_select_currentPath"),
		$ext=$("#imglossless_select_ext"),
		$btnCurrentPath=$("#imglossless_btn_currentPath"),
		$refresh=$("#imglossless_currentPath_refresh"),
		$btnSavePath=$("#imglossless_btn_savePath"),
		$hSavePath=$("#imglossless_savePath_hidden"),
		$hPath=$("#imglossless_path_hidden"),
		$btnCov=$("#imglossless_btn_cov"),
		$dragArea=$("#imglossless .drag_area"),
		$boxPreview=$("#imglossless .box_preview"),
		
		$itemOpenPos=$("#imglossless .imglist .icon-folder-open"),
		tmplFileList = $('#imglossless_tmpl_filelist').html();
	
	window.iSparta.imglossless ={
		options:{
			savePath:["self","parent"],
			currentPath:[],
			ext:"",
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
			var options=localData.getJSON("imglossless");
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
				
				if(i==options.extIndex){
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
						window.iSparta.imglossless.isClose=true;
					});
					this.index++;
					this.exec(id);
				}else{
					var filesInfo=window.iSparta.imglossless.fileList[0].files;
					var Allinfo=[];
					var postData=[];
					for(var i=0;i<filesInfo.length;i++){
						if(filesInfo[i].selected==true){
							var info={};
							info.name=filesInfo[i].name;
							info.beforesize=filesInfo[i].allSize;
							info.aftersize=filesInfo[i].imglosslessSize;
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
					
					window.iSparta.postData(postData,"imglossless");
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
            var name2=files[id].name2;
            var ext=this.options.ext;
            var path=savePath+"/"+name+ext;
            var filename=name+ext;
            if(savePath=="parent"){
            	var path=files[id].pppath+"/"+name+ext;
            }else if(savePath=="self"){
            	var path=files[id].ppath+"/"+name+ext;
            }
            var type=name2.substring(name2.indexOf(".")+1);
            path+="."+type;
            
            var pngout = process.cwd() + '/app/libs/imglossless/'+iSparta.getOsInfo()+'/pngout';
            var gifsicle = process.cwd() + '/app/libs/imglossless/'+iSparta.getOsInfo()+'/gifsicle';
            var jpegoptim = process.cwd() + '/app/libs/imglossless/'+iSparta.getOsInfo()+'/jpegoptim';

           	pngout=window.iSparta.handlePath(pngout);
           	gifsicle=window.iSparta.handlePath(gifsicle);
           	jpegoptim=window.iSparta.handlePath(jpegoptim);
            
   			var tempdir=os.tmpdir()+'iSparta/';
           	tempdir=window.iSparta.handlePath(tempdir);
           	try{
	           	dirHandle();
	        }
			catch(err){
				dirHandle();
			}
			function dirHandle(){
				fs.removeSync(tempdir);
	            fs.mkdirsSync(tempdir);
				imglosslessasmExec();
			};
			function imglosslessasmExec(){
				//var url=tempdir+'imglossless_new1.png';
				var pngoutcomd='"'+pngout+'" "'+url+'"';
				if(url!=path){
					pngoutcomd+=' "'+tempdir+name2+'"';
				}
				pngoutcomd+='  -force -y'; 
				jpegoptimcomd='"'+jpegoptim+'" -f -o  --strip-all -d "'+tempdir+'" "'+url+'"';
				gifsiclecomd='"'+gifsicle+'" --optimize=100 "'+url+'" > "'+tempdir+name2+'"';
				
				
				
				if(name.lastIndexOf("-lossless")!=-1){
					window.iSparta.imglossless.switch(id+1);
					return;
				}

				if(type=="gif"){
					
					exec(gifsiclecomd, {timeout: 1000000}, function(e){
						
						fs.copy(tempdir+name2, path,function(){
							window.iSparta.imglossless.switch(id+1);
						});
	            	});
	            	return;
				}
				if(type=="jpg"){
					
					exec(jpegoptimcomd, {timeout: 1000000}, function(e){
						
						fs.copy(tempdir+name2, path,function(){
							window.iSparta.imglossless.switch(id+1);
						});
	               
	            	});
	            	return;
				}
				if(type=="png"){
					
					exec(pngoutcomd, {timeout: 1000000}, function(e){
						console.log(pngoutcomd)
	                	fs.copy(tempdir+name2, path,function(e){
	                		
	                		window.iSparta.imglossless.switch(id+1);
	                	});
	            	});
	            	return;
					
				}
			}
			
		}
	};
	
	// 界面操作
	window.iSparta.imglossless.ui={
		dataHelper:{},
		init:function(){
			this.dataHelper=window.iSparta.imglossless.dataHelper;
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
				window.iSparta.imglossless.switch();
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
				var imglossless=window.iSparta.imglossless;
				e.preventDefault();
				$dragArea.removeClass("hover");
				e.preventDefault(); //取消默认浏览器拖拽效果
		        var otherFiles = e.dataTransfer.files; //获取文件对象
		        imglossless.options.mixListIndex++;
		        var mixIndex=imglossless.options.mixListIndex;
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
	        window.iSparta.imglossless.fileList=window.iSparta.fileManager.walk(fileList,"png","-lossless");
	        if(!window.iSparta.imglossless.fileList){

	        	window.iSparta.ui.hideLoading();
	        	window.iSparta.ui.showTips("目录读取失败！请确认文件目录是否存在！<br/>并且不能选择盘符！");
	        	
	        	return false;

	        };
	       	window.iSparta.ui.hideLoading();
	        var datas={};
	        datas.all=window.iSparta.imglossless.fileList;
	       
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
				var fileList=window.iSparta.imglossless.fileList;
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
		    	var fileList=window.iSparta.imglossless.fileList;
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
				},window.iSparta.imglossless.options.rate*1000);
		    });
		    $boxPreview.on("mouseout",".imglist .thumb",function(){
		    	var fileList=window.iSparta.imglossless.fileList;
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
		        var fileList=window.iSparta.imglossless.fileList;
		    	var li=$(this).closest("li");
		        var pid=li.attr("data-pid");
		        var id=li.attr("data-id");
		        fileList[pid].files[id].name=name;
		    });
		},
		status:function(){
			var ui=this;
			$currentPath.on("change",function(){
				var options=window.iSparta.imglossless.options;
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
				var options=window.iSparta.imglossless.options;
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
	window.iSparta.imglossless.dataHelper={
		changeLoop:function(loop){
			var imglossless=window.iSparta.imglossless;
			imglossless.options.loop=loop;
			window.iSparta.localData.setJSON("imglossless",imglossless.options);
		},
		changeRate:function(rate){
			var imglossless=window.iSparta.imglossless;
			imglossless.options.rate=rate;
			window.iSparta.localData.setJSON("imglossless",imglossless.options);
		},
		changeSavaPath:function(savePath){
			var imglossless=window.iSparta.imglossless;
			var theSavePath=imglossless.options.savePath;
			for(var i=0;i<theSavePath.length;i++){
				if(savePath==theSavePath[i]){
					break;
				}
			}

			var index=$savePath[0].selectedIndex;

			if((i!=theSavePath.length)||savePath=="parent"||savePath=="self"){

				imglossless.options.savePathIndex=i;
				window.iSparta.localData.setJSON("imglossless",imglossless.options);
			}else{
				if(imglossless.options.savePath.length>6){
					imglossless.options.savePath.splice(4,1);
				}
				var len=imglossless.options.savePath.length;
				imglossless.options.savePath.unshift(savePath);
				imglossless.options.savePathIndex=0;
				window.iSparta.localData.setJSON("imglossless",imglossless.options);
			}
			
		},
		changeExt:function(ext){
			var imglossless=window.iSparta.imglossless;	

			imglossless.options.ext=ext;
			
			window.iSparta.localData.setJSON("imglossless",imglossless.options);
			
		},
		changeCurrentPath:function(currentPath,theOtherFiles){
			var imglossless=window.iSparta.imglossless;
			var theCurrentPath=imglossless.options.currentPath;
			if(currentPath.indexOf("压缩列表")==0){

				for(var i=0;i<theCurrentPath.length;i++){
					if(currentPath==theCurrentPath[i]){
						break;
					}
				}
				var index=$currentPath[0].selectedIndex;
				if(i!=theCurrentPath.length){
					imglossless.options.currentPathIndex=i;
					window.iSparta.localData.setJSON("imglossless",imglossless.options);
				}else{
					if(imglossless.options.currentPath.length>4){
						imglossless.options.currentPath.splice(4,1);
					}
					imglossless.options.currentPath.unshift(currentPath);
					var len=imglossless.options.currentPath.length;
					imglossless.options.currentPathIndex=0;
					var otherFiles={id:imglossless.options.mixListIndex,path:[]};
					console.log(theOtherFiles)
					for(var i=0;i<theOtherFiles.length;i++){
						otherFiles.path.push(theOtherFiles[i].path);
					}
					
					imglossless.options.otherFiles.push(otherFiles);
					
					window.iSparta.localData.setJSON("imglossless",imglossless.options);
				}
			}else{
				for(var i=0;i<theCurrentPath.length;i++){
					if(currentPath==theCurrentPath[i]){
						break;
					}
				}
				var index=$currentPath[0].selectedIndex;
				if(i!=theCurrentPath.length){
					imglossless.options.currentPathIndex=i;
					window.iSparta.localData.setJSON("imglossless",imglossless.options);
				}else{
					if(imglossless.options.currentPath.length>4){
						imglossless.options.currentPath.splice(4,1);
					}
					imglossless.options.currentPath.unshift(currentPath);
					var len=imglossless.options.currentPath.length;
					imglossless.options.currentPathIndex=len-i+1;
					
					window.iSparta.localData.setJSON("imglossless",imglossless.options);
				}
			}
			
		}
	};
	// 文件目录递归与操作
	


})(jQuery);