 IM.setDebug(true);
 IM.setTolerance(80);
var bqs=[];
var cbqs=[];
bqs[0]=new Array();
bq0_size=[[6.06,5.93,7.44],[5.93,5.83,7.42],
        [5.83,6.01,7.55],[6.01,6.06,7.79],
        [6.06,5.98,7.78],[5.98,5.90,7.26],
        [5.90,6.04,7.73],[6.04,3.77,12.7],
        [3.77,3.12,6.12],[3.12,3.19,6.12],
        [3.19,3.04,6.03],[3.04,3.13,5.97],
        [3.13,4.58,7.54],[4.58,4.42,8.88],
        [4.42,4.40,8.71],[4.40,3.49,7.80],
        [3.49,2.84,6.25],[2.84,2.33,5.05],
        [2.33,2.00,4.22],[2.00,1.62,3.50],
        [1.62,1.54,3.05],[1.54,1.33,2.69],
        [1.33,1.33,2.46],[1.33,1.33,1.44]
        ]
for(var i=1;i<=25;i++){

    if(i<10){
        bqs[0].push('image/拜拜/拜拜000'+i+'.png');
    }else{
        bqs[0].push('image/拜拜/拜拜00'+i+'.png');
    }
}
bqs[1]=new Array();
for(var i=1;i<=16;i++){
    if(i<10){
        bqs[1].push('image/笨蛋/笨蛋000'+i+'.png');
    }else{
        bqs[1].push('image/笨蛋/笨蛋00'+i+'.png');
    }
}
// bqs[2]=new Array();
// for(var i=1;i<=16;i++){
//     if(i<10){
//         bqs[2].push('image/不开心/q000'+i+'.png');
//     }else{
//         bqs[2].push('image/不开心/q00'+i+'.png');
//     }
// }
bqs[2]=new Array();
for(var i=1;i<=16;i++){
    if(i<10){
        bqs[2].push('image/尴尬/q000'+i+'.png');
    }else{
        bqs[2].push('image/尴尬/q00'+i+'.png');
    }
}
bqs[3]=new Array();
for(var i=1;i<=16;i++){
    if(i<10){
        bqs[3].push('image/给你的心/q000'+i+'.png');
    }else{
        bqs[3].push('image/给你的心/q00'+i+'.png');
    }
}

// for(var i=0;i<4;i++){
//     cbqs[i]=new Array();
//     for(var j=0;j<4;j++){
//         cbqs[i][j]=new Array();
//         for(var k=0;k<(j+1)*2;k++){
            
//             cbqs[i][j][k]=new IM.image(bqs[i][k], 200, 200);
      
//         }
//     }
// }
// for(var i=0;i<4;i++){
//     cbqs[i]=new Array();
//     for(var j=0;j<4;j++){
//         cbqs[i][j]=new Array();
//         for(var k=0;k<(j+1)*2;k++){
            
//             cbqs[i][j][k]=new IM.image(bqs[i][k], 200, 200);
      
//         }
//     }
// }
var now1=-1;
change1(1);
function change1(type){
    $("#container1").html("")
    if(type==1){
        now1++;
    }else{
        now1--;
    }
   
    if(now1>23){
        now1=0;
    }
    if(now1<0){
        now1=23;
    }
    
    $("#num1").html(now1+"、"+(now1+1));
    var bq1=[
        new IM.image(bqs[0][now1], 200, 200),
        new IM.image(bqs[0][now1+1], 200, 200)
    ];

   IM.reset();
    IM.compare($("#container1")[0],bq1,
    function(aCanvas, nElapsedTime, nPercentageDiff) {
        if(!nPercentageDiff){
            nPercentageDiff=100;
        }
        $("#textResult1").html(nPercentageDiff + "%");
    },
    function(oCanvas, nElapsedTime, nPercentageDiff) {
        $("#textResult1").html(nPercentageDiff + "%");
    });
    $("#index1_1").html(now1);
    $("#index1_2").html(now1+1);
    var a=bq0_size[now1][0];
    var b=bq0_size[now1][1];
    var c=bq0_size[now1][2];

    var size1=(((a+b)-c)/(a+b)*100);
    size1=parseInt(size1*100)/100;
    size1=size1/100;

    $("#size1").html((size1*100)+"%");
    $("#size1_1").html(bq0_size[now1][0]);
    $("#size1_2").html(bq0_size[now1][1]);
    $("#size1_3").html(bq0_size[now1][2]);
    $("#imgcont1 img")[0].src=bqs[0][now1];
    $("#imgcont1 img")[1].src=bqs[0][now1+1];
    $("#imgcont1 img")[2].src="image/拜拜/拜拜"+(now1+1)+"."+(now1+2)+"/拜拜.png";
}
$("#pre1").click(function(){
    change1(2);
});
$("#next1").click(function(){
    change1(1);
});
// IM.compare(id("container1"),cbqs[0][0],
// function(aCanvas, nElapsedTime, nPercentageDiff) {
//     id("textResult1").innerHTML = nPercentageDiff + "%."
// },
// function(oCanvas, nElapsedTime, nPercentageDiff) {
//     id("textResult1").innerHTML = nPercentageDiff + "%."
// });

// IM.compare(id("container2"),cbqs[0][1],
// function(aCanvas, nElapsedTime, nPercentageDiff) {
//     id("textResult2").innerHTML = nPercentageDiff + "%."
// },
// function(oCanvas, nElapsedTime, nPercentageDiff) {
//     id("textResult2").innerHTML = nPercentageDiff + "%."
// });
// IM.compare(id("container3"),cbqs[0][2],
// function(aCanvas, nElapsedTime, nPercentageDiff) {
//     id("textResult3").innerHTML = nPercentageDiff + "%."
// },
// function(oCanvas, nElapsedTime, nPercentageDiff) {
//     id("textResult3").innerHTML = nPercentageDiff + "%."
// });