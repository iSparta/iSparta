
<html class="blank">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>动态图对比</title>
    <link href="css/styles.css" rel="stylesheet" type="text/css">
    
</head>
    <body>
        <h1>动态图对比<span class="tips">提示：可以按住"ctrl"和"+"键放大对比;可以在右边选择背景颜色</h1>
            <?php
                $namepre1="image/dongtai/";
                $num[1]=16;
                $num[2]=6;
                $num[3]=30;
                $num[4]=30;
                $num[5]=17;
                $num[6]=12;
                $num[7]=30;
                $num[8]=12;
                $num[9]=10;
                $num[10]=10;
                $num[11]=10;
                $num[12]=12;
                $num[13]=18;
                $num[14]=11;
                $num[15]=25;

                for($i=1;$i<11;$i++){
                    
                    $gifimg="image/dongtai/gif/".$i.".gif";
                    $apngimg="image/dongtai/apng/".$i.".png";
                    $lossimg="image/dongtai/loss/".$i.".png";
                    $apnglossimg="image/dongtai/apngloss/".$i.".png";
                   
                    
            ?>
                       
            <div class="imgcont clearfix" id="imgcont1">
                <div class="img">
                    <img src="<?php echo $gifimg; ?>"/>
                    <p>GIF</p>
                    <p>帧数：<strong><?php echo $num[$i] ?></strong>帧</p>
                    <p>大小：<strong><?php echo round(intval(filesize($gifimg))/1024, 2) ?></strong>k</p>
                </div>
                <div class="img">
                    <img src="<?php echo $apngimg; ?>"/>
                    <p>APNG</p>
                     <p>帧数：<strong><?php echo $num[$i] ?></strong>帧</p>
                    <p>大小：<strong><?php echo round(intval(filesize($apngimg))/1024, 2) ?></strong>k</p>
                </div>
                 <div class="img" style="display:none" >
                    
                    <img src="<?php echo $lossimg; ?>"/>
                    <p>PNG 有损后转换</p>
                     <p>帧数：<strong><?php echo $num[$i] ?></strong>帧</p>
                    <p>大小：<strong><?php echo round(intval(filesize($lossimg))/1024, 2) ?></strong>k</p>
                </div>
                <div class="img" style="display:none">
                    
                    <img src="<?php echo $apnglossimg; ?>"/>
                    <p>APNG 有损</p>
                     <p>帧数：<strong><?php echo $num[$i] ?></strong>帧</p>
                    <p>大小：<strong><?php echo round(intval(filesize($apnglossimg))/1024, 2) ?></strong>k</p>
                </div>
               

                
            </div>
  
            <?php
            }
            ?>
            
            
        </div>
        <div class="color">
            <div class="blank"></div>
            <div class="white"></div>
            <div class="transparent"></div>
            <div class="red"></div>
            <div class="green"></div>
            <div class="blue"></div>
        </div>
        <div class="show">
            <div class="item">
                <input type="checkbox" id="check_gif" name="check_gif" checked="checked" data-to="1"/>
                <label for="check_gif">GIF</label>
            </div>
            <div class="item">
                <input type="checkbox" id="check_apng" name="check_apng" checked="checked" data-to="2"/>
                <label for="check_apng">apng</label>
                
            </div>
            <div class="item">
                <input type="checkbox" id="check_loss" name="check_loss" data-to="3"/>
                <label for="check_loss">apngloss1</label>
                
            </div>
            <div class="item">
                <input type="checkbox" id="check_apngloss" name="check_apngloss" data-to="4"/>
                <label for="check_apngloss">apngloss2</label>
                
            </div>


            
        </div>

        <script type="text/javascript" src="js/jquery.min.js"></script>
        <script type="text/javascript" src="js/crc32.js"></script>
        <script type="text/javascript" src="js/udeferred.js"></script>
        <script type="text/javascript" src="js/apng-canvas.js"></script>
        
        <script type="text/javascript">
        APNG.ifNeeded(function() {
            for (var i = 0; i < document.images.length; i++) {
                var img = document.images[i];

                if (/\.png$/i.test(img.src)) APNG.animateImage(img);
            }
        });
        $(".color div").click(function(){
            $("html")[0].className="";
            $("html").addClass($(this)[0].className)
        });

        $(".show input").change(function(e){
            var id=parseInt($(this).attr("data-to"));
            
            if(this.checked){
                $(".imgcont .img:nth-child("+id+")").show();

            }else{
                $(".imgcont .img:nth-child("+id+")").hide();
            }

        })
        </script>

</body>
</html>