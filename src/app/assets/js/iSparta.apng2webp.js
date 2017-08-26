(function ($) {
	var child_process = require('child_process'),
		os = require('os'),
		fs = require('fs-extra'),
		Path = require('path'),
		gui = require('nw.gui'),
		doT = require('dot'),
		i18n = require('i18n');
	var $savePath=$("#apng2webp_select_savePath"),
		$currentPath=$("#apng2webp_select_currentPath"),
		$loop = $("#apng2webp_select_loop"),
		$config = $("#apng2webp_select_config"),
		$ratio = $("#apng2webp_select_ratio"),
		$currentLanguage=$("#apng2webp_select_language"),
		$btnCurrentPath=$("#apng2webp_btn_currentPath"),
		$refresh=$("#apng2webp_currentPath_refresh"),
		$btnSavePath=$("#apng2webp_btn_savePath"),
		$hSavePath=$("#apng2webp_savePath_hidden"),
		$hPath=$("#apng2webp_path_hidden"),
		$btnCov=$("#apng2webp_btn_cov"),
		$dragArea=$("#apng2webp .drag_area"),
		$boxPreview=$("#apng2webp .box_preview"),
		
		$itemOpenPos=$("#apng2webp .imglist .icon-folder-open"),
		tmplFileList = $('#apng2webp_tmpl_filelist').html();
		tmplBoxPreview = $boxPreview.html();
	
	window.iSparta.apng2webp ={
		options:{
			savePath:["self","parent"],
			currentPath:[],
			loop:'0',
			config:'',
			ratio:'75',
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
		hasInit:false,
		init:function(){
			localData=window.iSparta.localData;
			var options=localData.getJSON("apng2webp");
			$.extend(this.options,options);
			
			options=this.options;
			$loop.val(options.loop);
			$config.val(options.config);
			$ratio.val(options.ratio);
			$currentLanguage.val(window.locale.getLocale());
			
			for(var i=0;i<options.savePath.length;i++){
				if(options.savePath[i]=="parent"){
					var opt=new Option(i18n.__("Parent directory"),options.savePath[i]);
				}else if(options.savePath[i]=="self"){
					var opt=new Option(i18n.__("Same level directory"),options.savePath[i]);
				}else{
					var opt=new Option(options.savePath[i],options.savePath[i]);
				}
				
				if(i==options.extIndex){
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
					if(options.currentPath[i].indexOf(i18n.__("Convert list"))==0){
						fileList=[];
						for(var j=0;j<options.otherFiles.length;j++){
							if(options.currentPath[i]==i18n.__("Convert list")+options.otherFiles[j].id){
								for(var k=0;k<options.otherFiles[j].path.length;k++){
									fileList.push({path:options.otherFiles[j].path[k]});
								}
							}
						}
					}

					this.ui.fillImglist(fileList);
				}
				$currentPath[0].options.add(opt);
				
			}
			this.ui.init();
			window.iSparta.apng2webp.hasInit = true;
		},
		switch:function(id){
			if(!this.fileList[0]){
				window.iSparta.ui.showTips(i18n.__("No image selected"));
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
				window.iSparta.ui.showTips(i18n.__("No image selected"));
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
					window.iSparta.ui.showProgress(progress,i18n.__("Processing images: (%s/%s)", this.index+1, this.nums),function(){
						window.iSparta.apng2webp.isClose=true;
					});
					this.index++;
					this.exec(id);
				}else{
					var filesInfo=window.iSparta.apng2webp.fileList[0].files;
					var Allinfo=[];
					var postData=[];
					for(var i=0;i<filesInfo.length;i++){
						if(filesInfo[i].selected==true){
							var info={};
							info.name=filesInfo[i].name;
							info.beforesize=filesInfo[i].allSize;
							info.aftersize=filesInfo[i].apng2webpSize;
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
					
					window.iSparta.postData(postData,"apng2webp");
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
			var loop=this.options.loop;
			var config=this.options.config;
			var ratio=this.options.ratio;
			var path=savePath+"/"+name;
			if(savePath=="parent"){
				var path=files[id].pppath+"/"+name;
			}else if(savePath=="self"){
				var path=files[id].ppath+"/"+name;
			}
			path+=".webp";

			var de_optimised_name = name+"-de-optimised.png";
			var animation_json_name = name+"-animation_metadata.json";
			var animation_name = name+"-animation";

			var apng2webp_apngopt = process.cwd() + '/app/libs/apng2webp/'+iSparta.getOsInfo()+'/apng2webp_apngopt';
			var apngdisraw = process.cwd() + '/app/libs/apng2webp/'+iSparta.getOsInfo()+'/apngdisraw';
			var cwebp = process.cwd() + '/app/libs/webp/'+iSparta.getOsInfo()+'/cwebp';
			var webpmux = process.cwd() + '/app/libs/webp/'+iSparta.getOsInfo()+'/webpmux';

			apng2webp_apngopt=window.iSparta.handlePath(apng2webp_apngopt);
			apngdisraw=window.iSparta.handlePath(apngdisraw);
			cwebp=window.iSparta.handlePath(cwebp);
			
			var tempdir=Path.join(os.tmpdir(), '/iSparta/');
			tempdir=window.iSparta.handlePath(tempdir);
			var webpmux_args = '';

			// There is a root-exception handler so no need to catch fs exception
			dirHandle();

			function dirHandle(){
				fs.removeSync(tempdir);
				fs.mkdirsSync(tempdir);
				apng2webpExec();
			};
			function apng2webpExec() {
				apng2webp_apngoptExec().then(function() {
					return apngdisrawExec();
				}).then(function() {
					return cwebpExec();
				}).then(function() {
					return webpmuxExec();
				}).then(function() {
					window.iSparta.apng2webp.switch(id+1);
				}).catch(function(err) {
					console.log(err);
					window.iSparta.ui.hideLoading();
					window.iSparta.ui.hideProgress();
					window.iSparta.ui.showTips(i18n.__("Convert failed! Please check PNG file format, the image size should be equal"));
					fs.removeSync(tempdir);
				});
			};
			function apng2webp_apngoptExec() {
				var apng2webp_apngoptcomd = '"'+apng2webp_apngopt+'" "'+url+'" "'+tempdir+de_optimised_name+'"';
				return new Promise(function(resolve, reject) {
					child_process.exec(apng2webp_apngoptcomd, {timeout: 1000000}, function(err, stdout, stderr) {
						if (err) {
							console.log('stdout: ' + stdout);
							console.log('stderr: ' + stderr);
							reject(err);
						} else {
							resolve();
						}
					});
				});
			};
			function apngdisrawExec() {
				var apngdisrawcomd = '"'+apngdisraw+'" "'+tempdir+de_optimised_name+'" "'+animation_name+'"';
				return new Promise(function(resolve, reject) {
					child_process.exec(apngdisrawcomd, {timeout: 1000000}, function(err, stdout, stderr) {
						if (err) {
							console.log('stdout: ' + stdout);
							console.log('stderr: ' + stderr);
							reject(err);
						} else {
							resolve();
						}
					});
				});
			};
			function cwebpExec() {
				var data = fs.readFileSync(tempdir+animation_json_name, {encoding: 'utf-8'});
				var animation = JSON.parse(data);
				var frames = animation['frames'];
				var promises = frames.map(function(frame) {
					var png_frame_file = tempdir+frame['src'];
					var webp_frame_file = tempdir+frame['src']+".webp";
					var cwebpcomd = '"'+cwebp+'" "'+config+'" -q "'+ratio+'" "'+png_frame_file+'" -o "'+webp_frame_file+'"';
					
					return new Promise(function(resolve, reject) {
						child_process.exec(cwebpcomd, {timeout: 1000000}, function(err, stdout, stderr) {
							if (err) {
								console.log('stdout: ' + stdout);
								console.log('stderr: ' + stderr);
								reject(err);
								return;
							}
							var delay = Math.round((frame['delay_num']) / (frame['delay_den']) * 1000);
							if (delay === 0) { // The specs say zero is allowed, but should be treated as 10 ms.
								delay = 10;
							}
							var blend_mode = '';
							if (frame['blend_op'] === 0) {
								blend_mode = '-b';
							} else if (frame['blend_op'] === 1) {
								blend_mode = '+b';
							} else {
								throw new Error("Webp can't handle this blend operation");
							}
							var webpmux_arg = ' -frame "' + webp_frame_file + '" +' + delay + '+' + frame['x'] + '+' + frame['y'] + '+' + frame['dispose_op'] + blend_mode;
							resolve(webpmux_arg);
						});
					});
				});

				return Promise.all(promises).then(function(values) {
					for (webpmux_arg of values) {
						webpmux_args += webpmux_arg;
					}
					return Promise.resolve();
				});
			};
			function webpmuxExec() {
				var webpmuxcomd = '"'+webpmux+'"' + webpmux_args;
				if (loop) {
					webpmuxcomd += ' -loop ' + loop;
				}
				webpmuxcomd += ' -o "' + path + '"';
				return new Promise(function(resolve, reject) {
					child_process.exec(webpmuxcomd, {timeout: 1000000}, function(err, stdout, stderr) {
						if (err) {
							console.log('stdout: ' + stdout);
							console.log('stderr: ' + stderr);
							reject(err);
						} else {
							resolve();
						}
					});
				});
			};
		}
	};
	
	// 界面操作
	window.iSparta.apng2webp.ui={
		dataHelper:{},
		init:function(){
			this.dataHelper=window.iSparta.apng2webp.dataHelper;
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
			$loop.on('change', function() {
				ui.dataHelper.changeLoop($(this).val());
			});
			$config.on('change', function() {
				ui.dataHelper.changeConfig($(this).val());
			});
			$ratio.on('change', function() {
				ui.dataHelper.changeRatio($(this).val());
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
				window.iSparta.apng2webp.switch();
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
				var apng2webp=window.iSparta.apng2webp;
				e.preventDefault();
				$dragArea.removeClass("hover");
				e.preventDefault(); //取消默认浏览器拖拽效果
				var otherFiles = e.dataTransfer.files; //获取文件对象
				apng2webp.options.mixListIndex++;
				var mixIndex=apng2webp.options.mixListIndex;
				//var opt=new Option(fileList[0].path,fileList[0].path);
				var v=ui.fillImglist(otherFiles);
				if(v){
					var fileList=i18n.__("Convert list")+mixIndex;
					var opt=new Option(i18n.__("Convert list")+mixIndex,i18n.__("Convert list")+mixIndex);
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
			window.iSparta.apng2webp.fileList=window.iSparta.fileManager.walk(fileList,"png");
			if(!window.iSparta.apng2webp.fileList){

				window.iSparta.ui.hideLoading();
				window.iSparta.ui.showTips(i18n.__("Directory load failed! Please check whether the directory exists, disk letter is not allowd"));
				
				return false;

			};
			window.iSparta.ui.hideLoading();
			var datas={};
			datas.all=window.iSparta.apng2webp.fileList;
		   
			if(datas.all.length==0){
				if (window.iSparta.apng2webp.hasInit) {
					window.iSparta.ui.showTips(i18n.__("Please select APNG images"));
				}
				$boxPreview.html(tmplBoxPreview);
			}else{
				var doTtmpl = doT.template(tmplFileList);
				var html=doTtmpl(datas);
				$boxPreview.html(html);
			}

			return true;
		},
		items:function(){
			var timer=null;
			var ui=this;
			var urlIndex=0;
			$boxPreview.on("click",".imglist .thumb",function(){
				var fileList=window.iSparta.apng2webp.fileList;
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
				var fileList=window.iSparta.apng2webp.fileList;
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
				},window.iSparta.apng2webp.options.rate*1000);
			});
			$boxPreview.on("mouseout",".imglist .thumb",function(){
				var fileList=window.iSparta.apng2webp.fileList;
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
				var fileList=window.iSparta.apng2webp.fileList;
				var li=$(this).closest("li");
				var pid=li.attr("data-pid");
				var id=li.attr("data-id");
				fileList[pid].files[id].name=name;
			});
		},
		status:function(){
			var ui=this;
			$currentPath.on("change",function(){
				var options=window.iSparta.apng2webp.options;
				var path=$(this).val();

				if(path.indexOf(i18n.__("Convert list"))==0){
					var fileList=[];
					for(var j=0;j<options.otherFiles.length;j++){

						if(path==i18n.__("Convert list")+options.otherFiles[j].id){
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
				var options=window.iSparta.apng2webp.options;
				if(path.indexOf(i18n.__("Convert list"))==0){
					var fileList=[];
					for(var j=0;j<options.otherFiles.length;j++){

						if(path==i18n.__("Convert list")+options.otherFiles[j].id){
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
			$currentLanguage.on('change', function() {
				var locale=$(this).val();
				window.locale.changeLocale(locale);
			});
		}
	};
	// 数据控制
	window.iSparta.apng2webp.dataHelper={
		changeSavaPath:function(savePath){
			var apng2webp=window.iSparta.apng2webp;
			var theSavePath=apng2webp.options.savePath;
			for(var i=0;i<theSavePath.length;i++){
				if(savePath==theSavePath[i]){
					break;
				}
			}

			var index=$savePath[0].selectedIndex;

			if((i!=theSavePath.length)||savePath=="parent"||savePath=="self"){

				apng2webp.options.savePathIndex=i;
				window.iSparta.localData.setJSON("apng2webp",apng2webp.options);
			}else{
				if(apng2webp.options.savePath.length>6){
					apng2webp.options.savePath.splice(4,1);
				}
				var len=apng2webp.options.savePath.length;
				apng2webp.options.savePath.unshift(savePath);
				apng2webp.options.savePathIndex=0;
				window.iSparta.localData.setJSON("apng2webp",apng2webp.options);
			}
			
		},
		changeLoop:function(loop){
			var apng2webp=window.iSparta.apng2webp;
			apng2webp.options.loop=loop;
			window.iSparta.localData.setJSON("apng2webp",apng2webp.options);
		},
		changeConfig: function(config) {
			var apng2webp=window.iSparta.apng2webp;	
			apng2webp.options.config=config;
			window.iSparta.localData.setJSON("apng2webp",apng2webp.options);
			
		},
		changeRatio: function(ratio) {
			var apng2webp=window.iSparta.apng2webp;	
			apng2webp.options.ratio=ratio;
			window.iSparta.localData.setJSON("apng2webp",apng2webp.options);
		},
		changeCurrentPath:function(currentPath,theOtherFiles){
			var apng2webp=window.iSparta.apng2webp;
			var theCurrentPath=apng2webp.options.currentPath;
			if(currentPath.indexOf(i18n.__("Convert list"))==0){

				for(var i=0;i<theCurrentPath.length;i++){
					if(currentPath==theCurrentPath[i]){
						break;
					}
				}
				var index=$currentPath[0].selectedIndex;
				if(i!=theCurrentPath.length){
					apng2webp.options.currentPathIndex=i;
					window.iSparta.localData.setJSON("apng2webp",apng2webp.options);
				}else{
					if(apng2webp.options.currentPath.length>4){
						apng2webp.options.currentPath.splice(4,1);
					}
					apng2webp.options.currentPath.unshift(currentPath);
					var len=apng2webp.options.currentPath.length;
					apng2webp.options.currentPathIndex=0;
					var otherFiles={id:apng2webp.options.mixListIndex,path:[]};
					for(var i=0;i<theOtherFiles.length;i++){
						otherFiles.path.push(theOtherFiles[i].path);
					}
					
					apng2webp.options.otherFiles.push(otherFiles);
					
					window.iSparta.localData.setJSON("apng2webp",apng2webp.options);
				}
			}else{
				for(var i=0;i<theCurrentPath.length;i++){
					if(currentPath==theCurrentPath[i]){
						break;
					}
				}
				var index=$currentPath[0].selectedIndex;
				if(i!=theCurrentPath.length){
					apng2webp.options.currentPathIndex=i;
					window.iSparta.localData.setJSON("apng2webp",apng2webp.options);
				}else{
					if(apng2webp.options.currentPath.length>4){
						apng2webp.options.currentPath.splice(4,1);
					}
					apng2webp.options.currentPath.unshift(currentPath);
					var len=apng2webp.options.currentPath.length;
					apng2webp.options.currentPathIndex=len-i+1;
					
					window.iSparta.localData.setJSON("apng2webp",apng2webp.options);
				}
			}
			
		}
	};
	// 文件目录递归与操作
	


})(jQuery);