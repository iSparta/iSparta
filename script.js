var FileName="";
window.onbeforeunload=function(){
    delFiles();
    return "是否离开该页面？";
}
$(document).ready(function(){

    if (window.File && window.FileReader && window.FileList && window.Blob){  
        $(".support").show();
        $(document).bind({
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
        var isOn=false;
        $("body")[0].ondragover = function() {
            $(".preview_area").addClass("on");
            if(isOn=false){
                $(".preview_area .txt1").hide();
                $(".preview_area .txt2").show();                
            }
            return false;
        };

        $("body")[0].ondragleave = function(e) { 
            $(".preview_area").removeClass("on");
            if(isOn=false){
                $(".preview_area .txt1").show();
                $(".preview_area .txt2").hide();
            }
            return false;
        };
        $("body")[0].ondrop = function(e) {

            $(".preview_area").removeClass("on");
            var img=e.dataTransfer.files[0];
            if(img.type=="image/png"){
                $(".preview_area .txt1").hide();
                $(".preview_area .txt2").hide();
                delFiles();
                $(".preview_area .loading").show();
                var reader = new FileReader();
                var d = new Deferred();
                reader.readAsDataURL(img);
                var xhr = new XMLHttpRequest();
                xhr.open("post", "upload.php", true);
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                xhr.addEventListener("load", function(e){
                    FileName=e.target.responseText;
                     $(".preview_area .loading").hide();
                    var url="upload/"+e.target.responseText;
                    $(".preview_area .preview").remove();
                    $('<div class="preview"><img src="'+url+'"/></div>').appendTo($(".preview_area"));

                    APNG.animateImage($(".preview img")[0]);
                }, false);
                var fd = new FormData();
                fd.append('xfile', img);

                xhr.send(fd);
            }else{
                $(".preview_area .txt1").show();
                $(".preview_area .txt2").hide();                
                $(".tips").show();
            }
            e.preventDefault(); //取消默认浏览器拖拽效果
            return false;
        };
        $(".bg > div").click(function(){
            $(".preview_area").css("background",$(this).css("background"))
        })
    }
    else {
        $(".unsupport").show();
    }
});
function delFiles(){
    if(FileName){
        $.post("del.php",{name:FileName},function(){
           
        });
    }
}