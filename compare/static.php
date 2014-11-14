
<html class="blank">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>静态图对比</title>
    <link href="css/styles.css" rel="stylesheet" type="text/css">
    
</head>
    <body>
        <h1>静态图对比<span class="tips">提示：可以按住"ctrl"和"+"键放大对比;可以在右边选择背景颜色</h1>
            <?php
                $namepre1="image/dongtai/";
                for($i=1;$i<16;$i++){
                    
                    $pngimg="image/static/png/".$i.".png";
                    $pnglossimg="image/static/pngloss/".$i.".png";
                   
                    
            ?>
                       
            <div class="imgcont clearfix" id="imgcont1">
                <div class="img">
                    <img src="<?php echo $pngimg; ?>"/>
                    <p>PNG</p>
                    <p>大小：<strong><?php echo round(intval(filesize($pngimg))/1024, 2) ?></strong>k</p>
                </div>
                <div class="img">
                    <img src="<?php echo $pnglossimg; ?>"/>
                    <p>PNG LOSS</p>
                    <p>大小：<strong><?php echo round(intval(filesize($pnglossimg))/1024, 2) ?></strong>k</p>
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
        </script>

</body>
</html>