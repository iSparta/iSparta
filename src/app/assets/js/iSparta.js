(function ($) {

	var gui = require('nw.gui');
	var win = gui.Window.get();
	var os = require('os');
	var fs = require('fs');
	var version = "1.1";
	
	window.iSparta = {
		sep:"/",
		init: function() {
			var ui = window.iSparta.ui;
			if(this.getOsInfo().indexOf("win")!=-1){
				this.sep="\\";
			}			
			ui.init();
			this.checkVersion();
			var openedNum=this.localData.get("openedNum");
			process.on('uncaughtException', function (err) {
				console.log('Caught exception: ' + err);
				window.iSparta.ui.hideLoading();
				window.iSparta.ui.hideProgress();
	        	window.iSparta.ui.showTips("程序发生错误，请重试！");
			});
			
			if(!openedNum){
				this.localData.remove("apng");
				this.localData.remove("webp");
				this.localData.set("openedNum",1);
			}else{
				openedNum=parseInt(openedNum)+1;
				this.localData.set("openedNum",openedNum);
			}
		},
		handlePath:function(path){
			var temp=path;
			if(this.getOsInfo().indexOf("win")!=-1){
				temp=path.replace(/\//g,"\\");
			}else{
				temp=path.replace(/\\/g,"/");
			}

			return temp;
		},
		getOsInfo: function() {
			var _pf = navigator.platform;
			var appVer = navigator.userAgent;
			
			if (_pf == "Win32" || _pf == "Windows") {
				if (appVer.indexOf("WOW64")>-1) { 
					_bit = "win64"; 
				} else { 
					_bit = "win32";
				}
				return _bit;
			}
			if (_pf.indexOf("Mac")!=-1) { 
				return "mac"; 
			} else if (_pf == "X11") {
				return "unix"; 
			} else if (String(_pf).indexOf("Linux") > -1) { 
				return "linux"; 
			} else {
				return "unknown"; 
			}
		},

		postData: function(data, type) {
			var hostname = os.hostname();
			var osInfo = this.getOsInfo();
			var timestamp = Date.parse(new Date());

			for (var i=0; i<data.length; i++) {
				data[i].hostname = hostname;
				data[i].osInfo = osInfo;
				data[i].timestamp = timestamp;
				if (!data[i].num) {
					data[i].num = 1;
				}
				data[i].version = version;
				data[i].type = type;
				$.post("http://zhijie.me/iSparta/data.php", data[i], function(result){});
			}
		},
				
		checkVersion: function() {
			var ui = this.ui;
			$.get("http://zhijie.me/iSparta/data.php", {versioncheck:version}, function(result) {
				if(result=="new"){
					
				}else{
					ui.showTips("有版本更新！前往下载！", 2, function(){
						gui.Shell.openExternal(result);
					});
				}
			});			
		}
	};

	window.iSparta.ui = {
		initIndex:[false,false,false,false,false,false],
		init: function() {
			this.sysInit();
			this.viewInit();
			this.popInit();

			$(document).on({
		        dragleave:function(e){    
		            e.preventDefault();
		        },

		        drop:function(e){      
		            e.preventDefault();
		        },

		        dragenter:function(e){
		            e.preventDefault();
		        },

		        dragover:function(e){      
		            e.preventDefault();
		        }
		    });
		},

		sysInit: function() {
			$('.close').click(function() {
				win.close();
			});
			$('.minimize').click(function() {
				win.minimize();
			});
		},

		viewInit: function() {
			var localData=window.iSparta.localData;
			var self=this;
			var currentTab=localData.get("currentTab");
			if(!currentTab){
				localData.set("openedNum",1);
				currentTab=1;
				self.initIndex[0]=true;
			}
			// slef.initIndex[currentTab-1]=true;
			this.initTab(currentTab);
			self.tabSwitch(currentTab-1);
			$(".func_tab .tab_trigger>li").click(function() {
				
				var index = $(".func_tab .tab_trigger>li").index($(this));
				self.tabSwitch(index);
				
			});
		},
		tabSwitch:function(index){
			
			var localData=window.iSparta.localData;
			var trigger = $(".func_tab .tab_trigger>li");
			trigger.removeClass("active");
			$(trigger).eq(index).addClass("active");
			$(trigger).closest(".func_tab").find(".tab_content>.cont").removeClass("active");
			$(trigger).closest(".func_tab").find(".tab_content>.cont").eq(index).addClass("active");
			if(!this.initIndex[index]){
				localData.set("currentTab",index+1);
				this.initTab(index+1);
				this.initIndex[index]=true;
			}			
		},
		initTab:function(index){
			switch(index){
				case 1:
				window.iSparta.apng.init();
				break;
				case 2:
				window.iSparta.webp.init();
				break;
				case 3:
				window.iSparta.imglossless.init();
				break;
				case 4:
				window.iSparta.pngloss.init();
				break;
			}			
		},
		
		popInit: function() {
			$(".pop button[data-trigger='close']").click(function() {
				window.iSparta.ui.hideTips();
			});
		},

		showLoading: function(txt) {
			if(!txt){
				txt="正在处理，请稍后...";
			}
			$(".pop_loading .txt").html(txt);
			$(".pop_loading").addClass("active");
		},

		hideLoading: function(){
			$(".pop_loading").removeClass("active");
		},

		showProgress: function(progress, txt, closeCallback){
			if(!txt){
				txt="正在处理，请稍后...";
			}
			$(".pop_progress .load-bar-inner").css({width:progress*100+"%"})
			$(".pop_progress .txt").html(txt);
			$(".pop_progress").addClass("active");
			$(".pop_progress  button[data-trigger='close']").one("click", function(){
				if(closeCallback){
					window.iSparta.ui.showLoading();
					closeCallback();
					window.iSparta.ui.hideProgress();
					
				}
			});
		},

		hideProgress:function(){
			$(".pop_progress").removeClass("active");
		},

		showTips:function(txt,type,yesCallback,closeCallback){
			if(!txt){
				txt="出错了，请重试！";
			}
			$(".pop_tips .txt").html(txt);
			
			if(type==2) {
				// console.log($(".pop_tips  button[data-trigger='yes']"))
				$(".pop_tips  button[data-trigger='yes']").show();
				$(".pop_tips  button[data-trigger='yes']").on("click",function(){
					if(yesCallback){
						yesCallback();
					}
					$(".pop_tips").removeClass("active");
				});
			}else{
				$(".pop_tips  button[data-trigger='yes']").hide();
			}
			$(".pop_tips  button[data-trigger='close']").one("click",function(){
				if(closeCallback){
					closeCallback();
				}
			});			
			$(".pop_tips").addClass("active");
		},

		hideTips:function(){
			$(".pop_tips").removeClass("active");
		}
	};

	window.iSparta.localData = {

		storage: window.localStorage,
		remove:function(key){
			this.storage.removeItem(key);
		},
		get: function(key) {
			return this.storage.getItem(key);
		},

		set: function(key,value) {
			this.storage.setItem(key,value);
		},

		getJSON: function(key) {
			var val = this.storage.getItem(key);
			
			try{
				val = JSON.parse(val);
			}catch(e){
				this.remove(key);
				return {};
			}
			
			
			
			return val;
		},

		setJSON: function(key,value) {
			this.storage.setItem(key,JSON.stringify(value));
		}
	}
	window.iSparta.fileManager={
	    length:-1,
	    nowLen:0,
	    names:[],
	    allsize:0,
	    maxDepth:3,
	    nowDepth:0,
	    Files:{},
	    walk:function(fileList,ext,except,maxdepth,callback){
	        // 一次只拉一个文件夹
	       	ext=ext?ext:"png";
	       	maxDepth=maxdepth?maxDepth:3;
	       	var Files=this.Files;
	        this.length=0;
	        Files.fileList=[];
	        this.names=[];
	        if(fileList[0].path.length==3){
	        	return false;
	        }
	        
	        for(var i=0;i<fileList.length;i++){
	        	
	            var path=fileList[i].path;
	            
	           	if(!fs.existsSync(path)){
	           		return false;
	           	}

	           	this.nowDepth=-1;
	            if(fs.statSync(path).isDirectory()){
	            	this.nowDepth++;
	            	var dirs={};
	                var url=path.substring(0,path.lastIndexOf(iSparta.sep));
	                dirs.url=url;
	                dirs.length=this.length+i;
	                dirs.files=[];
	                Files.fileList.push(dirs);
	                this.walkDir(path,ext,except);
	                //fileWalk.length++;
	            }else if(fs.statSync(path).isFile()){
	                var url=path.substring(0,path.lastIndexOf(iSparta.sep));

	                //if(fileWalk.length==0||url!=fileWalk.allFileList[fileWalk.length].url){
	                	var dirs={};
	                	
	                    dirs.url=url;
	                    dirs.files=[];
	                    if(this.nowLen!=this.length||(this.length==0&&(!Files.fileList[this.length]||url!=Files.fileList[this.length].url))){
	                        Files.fileList.push(dirs);
	                    }
	                    if(this.nowLen!=this.length){
	                        this.nowLen=this.length
	                    }

	                    this.walkFile(path,ext,except);

	            }
	            
	            
	        }
	        this.nowDepth=-1;
	        var len=Files.fileList.length;
	        var listTemp=Files.fileList;
	        for(var i=len-1;i>=0;i--){
	            var len2=Files.fileList.length;
	            if(Files.fileList[i].files.length==0){
	                Files.fileList.splice(len2-1,1);
	               
	            }
	        }
	        
	        if((typeof callback)=='function'){
	        	callback();
	        }
	        return Files.fileList;
	    },
	    walkFile:function(path,ext,except){
	        //var apng={name:name};
	         var Files=this.Files;
	         path.replace(/(^\s*)|(\s*$)/g, "");  
	         var reg1=new RegExp(".*\\."+ext+ "$", "i"); 
	        
	        if(reg1.test(path)){
	        	 
	            //apng.frames.push(path);
	            var url=path;
	            var repeatIndex=-1;
	           
	            var allfile=Files.fileList[this.length].files;
	            var stat=fs.statSync(path);
	            var size=stat.size;
	            path2=path;
	            var reg2=new RegExp( "\\."+ext+ "$", "i"); 
	            path=path.replace(reg2,"");
	            var ppath=path.substring(0,path.lastIndexOf(iSparta.sep));
	            
	            var pppath=ppath.substring(0,ppath.lastIndexOf(iSparta.sep));
	            var name=path.substring(path.lastIndexOf(iSparta.sep)+1,path.length);
	            if(except){
	            	var reg3=new RegExp( ".*"+except+ "$", "i"); 
	            	 if(reg3.test(name)){
	            	 	return;
	            	 }
	            } 
	            var name2=path2.substring(path2.lastIndexOf(iSparta.sep)+1,path2.length);
                var file={path2:path2,name2:name2,path:path,ppath:ppath,pppath:pppath,selected:true};
                file.url=[];
                
                
                file.name=name;
                file.allSize=size;
                this.names.push(name);
                file.url.push(url);
                allfile.push(file);
        

	        }
	    },
	    walkDir:function(path,ext,except){
	        var dirList = fs.readdirSync(path);
	        var that=this;
			that.nowDepth++;
	        dirList.forEach(function(item){
	        	
	        	
	            if(fs.statSync(path + iSparta.sep + item).isDirectory()){ 
	            	
	        		if(that.nowDepth<that.maxDepth){
	        			
	        			that.walkDir(path + iSparta.sep + item,ext,except);

	        		}
	        		if(that.nowDepth>=that.maxDepth){
	        			
	        		
	        		}
	            }else if(fs.statSync(path + iSparta.sep + item).isFile()){

	                that.walkFile(path + iSparta.sep + item,ext,except);
	            }
	        });
	        that.nowDepth--;
	        
	    }
	}
})(jQuery);