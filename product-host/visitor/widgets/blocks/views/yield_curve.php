<style>
    .nvd3 .nv-axis.nv-x path.domain {
        stroke-opacity: 1!important;
    }

    #yieldCurveChart
    svg{
        height: 100%!important;
        width: 115%!important;
        margin-left: -20px;
    }
    #yieldCurveChart{
        position: relative;
    }
    #yieldCurveChart .left{
        position: absolute!important;
        top:50%!important;
        font-size: 14px!important;
        left: -30px!important;
        transform:rotate(-90deg) translateY(62%) translateX(20px)!important;
    }
    #yieldCurveChart .bottom{
        position: absolute!important;
        left:50%!important;
        text-align: center;
        font-size: 14px!important;
        transform:translateX(-30%) translateY(-80%)!important ;
    }
    .tooltip_from_nv{
        padding:2px;
    }
    .date{
        display: flex;
        gap:2px;
        align-items: center;
    }
</style>

<?php
use \common\models\YCYields;
//get all days
$days = \common\models\YCPeriods::find()->all();

//sort all days
usort($days, function ($a, $b) {
    $dayA = strtotime($a->date);
    $dayB = strtotime($b->date);
    return $dayB - $dayA;
});

//get current day
$day = $days[0]->date;


$get_current_day_datas_array = YCYields::find()->where(['date' => $day])->all();


$get_current_day_datas = [];


for ($i = 0; $i < count($get_current_day_datas_array); $i++) {
    $get_current_day_datas[$i] = [$get_current_day_datas_array[$i]->date, $get_current_day_datas_array[$i]->period, $get_current_day_datas_array[$i]->profitability];
}

?>

<link rel="stylesheet" href="/yield_excel/css/nv.css">
<script src="/yield_excel/js/jquery.js"></script>
<script src="/yield_excel/js/v3.js"></script>
<script src="/yield_excel/js/d3.js"></script>

<div id="yieldCurveChart"  style="height: 300px;">
    <svg></svg>
    <p class="left"> <?= Yii::t('app', 'Gəlirlilik')?> </p>
    <p class="bottom"><?= Yii::t('app', 'periods')?> </p>
</div>
<br>

<div class="blue_btn" style="cursor: pointer;" onclick="window.location.href='/home/chart?language=<?=Yii::$app->language?>'"><?= Yii::t('app', 'Gəlirlilik əyrisi Daha Cox')?> </div>

<script>

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return '#4BC7B5';
    }
    var arr=<?=json_encode($get_current_day_datas)?>;

    function generateData(arr, day) {

        var data = [];

        for(a in arr){
            data.push({
                x:arr[a][1],
                y:arr[a][2],
                series:0,
            })
        }
        return {
            values: data,
            key: day,
            color: getRandomColor()
        }
    }

    let chart = nv.models.lineChart();

    var datas=[];
    nv.addGraph(function() {
        var days = { 90: "<?= Yii::t('app', '3 ay')?>",365: "<?= Yii::t('app', '1 il')?>",730: "<?= Yii::t('app', '2 il')?>", 1096:"<?= Yii::t('app', '3 il')?>",1460:"<?= Yii::t('app', '4 il')?>",1800:"<?= Yii::t('app', '5 il')?>"};
        chart.xAxis.tickValues([ 30, 90, 180, 270, 365, 730, 1096, 1460, 1800 ])
                .tickFormat(function(d){
                    return days[d];
                });
        chart.yAxis.tickValues([0,2,4,6,8,10])
                .tickFormat(d3.format(''));
        chart.xAxis.showMaxMin(true);
        chart.showLegend(false);
        chart.useInteractiveGuideline(true);
        chart.forceY([0, 16]);
        chart.forceX([0, 1600]);
        datas.push(generateData(arr, '<?=$day?>'));

        var tooltip=chart.interactiveLayer.tooltip;
        tooltip.contentGenerator(function (key, x, y, e, graph) {
            var html='';

            console.log(key);
            var d=days[key.series[0]['data']['x']];
            if(d==undefined){
                d=key.series[0].data.x+ ' <?= Yii::t('app', 'days')?>';
            }
            html+='<div class="tooltip_from_nv"><p><strong>' +d+ ' </strong></p>' +
                    '<div class="date"><p class="color" style="background: '+key.series[0].color+'"></p>'+
                    '<p >'+key.series[0]['key']+'</p>' +
                    '<p class="val">'+key.series[0]['data']['y']+'</p>' +
                    '</div></div>'
            ;
            return html;
        });
        d3.select('#yieldCurveChart svg')
                .datum(datas)
                .transition().duration(500)
                .call(chart)
                .style('transform', 'translate(0,0);');
        d3.select(".nv-axislabel").attr("y","");
        nv.utils.windowResize(function() { chart.update() });
        return chart;
    });
    setInterval(function (){
        chart.update();
    }, 100);
</script>
