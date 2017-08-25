(function ($) {
	var child_process = require('child_process'),
		fs = require('fs-extra'),
		path = require('path'),
		gui = require('nw.gui'),
		doT = require('dot'),
		i18n = require('i18n');

	var $savePath=$("#webp_select_savePath"),
		$currentPath=$("#webp_select_currentPath"),
		$config = $("#webp_select_config"),
		$ratio = $("#webp_select_ratio"),
		$currentLanguage=$("#webp_select_language"),
		$btnCurrentPath=$("#webp_btn_currentPath"),
		$refresh=$("#webp_currentPath_refresh"),
		$btnSavePath=$("#webp_btn_savePath"),
		$hSavePath=$("#webp_savePath_hidden"),
		$hPath=$("#webp_path_hidden"),
		$btnCov=$("#webp_btn_cov"),
		$dragArea=$("#webp .drag_area"),
		$boxPreview=$("#webp .box_preview"),
		
		$itemOpenPos=$("#webp .imglist .icon-folder-open"),
		tmplFileList = $('#webp_tmpl_filelist').html();
		tmplBoxPreview = $boxPreview.html();

	window.iSparta.webp = {
		options:{
			savePath:["self","parent"],
			currentPath:[],
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
			var options=localData.getJSON("webp");
			$.extend(this.options,options);
			
			options=this.options;
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
			window.iSparta.webp.hasInit = true;
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
						window.iSparta.webp.isClose=true;
					});
					this.index++;
					this.exec(id);
				}else{
					var filesInfo=window.iSparta.webp.fileList[0].files;
					var Allinfo=[];
					var postData=[];
					for(var i=0;i<filesInfo.length;i++){
						if(filesInfo[i].selected==true){
							var info={};
							info.name=filesInfo[i].name;
							info.beforesize=filesInfo[i].allSize;
							info.aftersize=filesInfo[i].webpSize;
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
					
					window.iSparta.postData(postData,"webp");
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
			var config=this.options.config;
			var ratio=this.options.ratio;
			var path=savePath+"/"+name;
			if(savePath=="parent"){
				var path=files[id].pppath+"/"+name;
			}else if(savePath=="self"){
				var path=files[id].ppath+"/"+name;
			}
			path+=".webp";

			var dConfig = '-m 6 ';
			var param = dConfig + config + ' -q ' + ratio + ' ';
			var cwebp = process.cwd() + '/app/libs/webp/' + iSparta.getOsInfo() + '/cwebp';
			cwebp=window.iSparta.handlePath(cwebp);

			var cwebpcomd = '"' + cwebp + '" ' + param + '"' + url + '" -o "' + path + '"';

			child_process.exec(cwebpcomd, {timeout: 1000000}, function(err, stdout, stderr) {
				if (err) throw err;
				window.iSparta.webp.switch(id+1);
			});
		}
	}


	// 界面操作
	window.iSparta.webp.ui={
		dataHelper:{},
		init:function(){
			this.dataHelper=window.iSparta.webp.dataHelper;
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
				window.iSparta.webp.switch();
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
				var webp=window.iSparta.webp;
				e.preventDefault();
				$dragArea.removeClass("hover");
				e.preventDefault(); //取消默认浏览器拖拽效果
				var otherFiles = e.dataTransfer.files; //获取文件对象
				webp.options.mixListIndex++;
				var mixIndex=webp.options.mixListIndex;
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
			var pngLists = window.iSparta.fileManager.walk(fileList,"png");
			var jpegLists = window.iSparta.fileManager.walk(fileList,"jpg");
			if (!pngLists || !jpegLists) {
				window.iSparta.ui.hideLoading();
				window.iSparta.ui.showTips(i18n.__("Directory load failed! Please check whether the directory exists, disk letter is not allowd"));
				
				return false;
			};
			var totalLists = [];
			if (pngLists && pngLists.length !== 0) {
				Array.prototype.push.apply(totalLists, pngLists);
			}
			if (jpegLists && jpegLists.length !== 0) {
				Array.prototype.push.apply(totalLists, jpegLists);
			}
			window.iSparta.webp.fileList = totalLists;
			window.iSparta.ui.hideLoading();
			
			var datas={};
			datas.all=window.iSparta.webp.fileList;
		   
			if(datas.all.length==0){
				if (window.iSparta.webp.hasInit) {
					window.iSparta.ui.showTips(i18n.__("Please select PNG or JPEG images"));
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
				var fileList=window.iSparta.webp.fileList;
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
				var fileList=window.iSparta.webp.fileList;
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
				},window.iSparta.webp.options.rate*1000);
			});
			$boxPreview.on("mouseout",".imglist .thumb",function(){
				var fileList=window.iSparta.webp.fileList;
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
				var fileList=window.iSparta.webp.fileList;
				var li=$(this).closest("li");
				var pid=li.attr("data-pid");
				var id=li.attr("data-id");
				fileList[pid].files[id].name=name;
			});
		},
		status:function(){
			var ui=this;
			$currentPath.on("change",function(){
				var options=window.iSparta.webp.options;
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
				var options=window.iSparta.webp.options;
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
	window.iSparta.webp.dataHelper={
		changeSavaPath:function(savePath){
			var webp=window.iSparta.webp;
			var theSavePath=webp.options.savePath;
			for(var i=0;i<theSavePath.length;i++){
				if(savePath==theSavePath[i]){
					break;
				}
			}

			var index=$savePath[0].selectedIndex;

			if((i!=theSavePath.length)||savePath=="parent"||savePath=="self"){

				webp.options.savePathIndex=i;
				window.iSparta.localData.setJSON("webp",webp.options);
			}else{
				if(webp.options.savePath.length>6){
					webp.options.savePath.splice(4,1);
				}
				var len=webp.options.savePath.length;
				webp.options.savePath.unshift(savePath);
				webp.options.savePathIndex=0;
				window.iSparta.localData.setJSON("webp",webp.options);
			}
			
		},
		changeConfig: function(config) {
			var webp=window.iSparta.webp; 
			webp.options.config=config;
			window.iSparta.localData.setJSON("webp",webp.options);
			
		},
		changeRatio: function(ratio) {
			var webp=window.iSparta.webp; 
			webp.options.ratio=ratio;
			window.iSparta.localData.setJSON("webp",webp.options);
		},
		changeCurrentPath:function(currentPath,theOtherFiles){
			var webp=window.iSparta.webp;
			var theCurrentPath=webp.options.currentPath;
			if(currentPath.indexOf(i18n.__("Convert list"))==0){

				for(var i=0;i<theCurrentPath.length;i++){
					if(currentPath==theCurrentPath[i]){
						break;
					}
				}
				var index=$currentPath[0].selectedIndex;
				if(i!=theCurrentPath.length){
					webp.options.currentPathIndex=i;
					window.iSparta.localData.setJSON("webp",webp.options);
				}else{
					if(webp.options.currentPath.length>4){
						webp.options.currentPath.splice(4,1);
					}
					webp.options.currentPath.unshift(currentPath);
					var len=webp.options.currentPath.length;
					webp.options.currentPathIndex=0;
					var otherFiles={id:webp.options.mixListIndex,path:[]};
					for(var i=0;i<theOtherFiles.length;i++){
						otherFiles.path.push(theOtherFiles[i].path);
					}
					
					webp.options.otherFiles.push(otherFiles);
					
					window.iSparta.localData.setJSON("webp",webp.options);
				}
			}else{
				for(var i=0;i<theCurrentPath.length;i++){
					if(currentPath==theCurrentPath[i]){
						break;
					}
				}
				var index=$currentPath[0].selectedIndex;
				if(i!=theCurrentPath.length){
					webp.options.currentPathIndex=i;
					window.iSparta.localData.setJSON("webp",webp.options);
				}else{
					if(webp.options.currentPath.length>4){
						webp.options.currentPath.splice(4,1);
					}
					webp.options.currentPath.unshift(currentPath);
					var len=webp.options.currentPath.length;
					webp.options.currentPathIndex=len-i+1;
					
					window.iSparta.localData.setJSON("webp",webp.options);
				}
			}
			
		}
	};
	// 文件目录递归与操作

})(jQuery);