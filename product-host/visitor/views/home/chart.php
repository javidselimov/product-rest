<?php

//SAFAROFF AMAZING CODE QUALITY.


use \common\models\YCPeriods;
use \common\models\YCYields;

//get all days
$days = YCPeriods::find()->all();

//sort all days
usort($days, function ($a, $b) {
    $dayA = strtotime($a->date);
    $dayB = strtotime($b->date);

    return $dayB - $dayA;
});

//get current day
$day = $days[0]->date;

//--datepicker active days
$active_days = [];
for ($i = 0; $i < count($days); $i++) {
    $active_days[] = $days[$i]->date;
}
$dates = $active_days;
//--datepicker active days


//--get yield datas
$get_current_day_array = YCYields::find()->where(['date' => $day])->all();
$get_current_day_datas = [];
for ($i = 0; $i < count($get_current_day_array); $i++) {
    $get_current_day_datas[$i] = [$get_current_day_array[$i]->date, $get_current_day_array[$i]->period, $get_current_day_array[$i]->profitability];
}

//--get yield datas


//--get yield parametrs
$params = \common\models\YCParams::find()->where(['date' => $day])->one()->attributes;
//--get yield parametrs

//--get yield periods
$yield_params = YCPeriods::find()->where(['date' => $day])->one();
$yield_params_data = [$yield_params->three_month,
    $yield_params->six_month,
    $yield_params->nine_month,
    $yield_params->one_year,
    $yield_params->two_year,
    $yield_params->three_year,
    $yield_params->four_year];
$yield_params = $yield_params_data;
//--get yield periods


?>

<script src="/yield_excel/js/jquery.js"></script>
<link rel="stylesheet" href="/yield_excel/css/nv.css">
<script src="/yield_excel/js/datepicker.js"></script>
<script src="/yield_excel/js/moment.js"></script>
<link href="/yield_excel/css/standalone.css" rel="stylesheet"/>
<script src="/yield_excel/js/d3v3.js"></script>
<script src="/yield_excel/js/nvd3.js"></script>


<style>
    .content_content {
        flex-basis: 100%;
    }

    aside {
        flex: 0 0 330px;
    }

    @media (max-width: 900px) {
        #datepicker-container {
            order: 1;
        }

        .parametrs {
            order: 2;
        }

        .download_button {
            order: 4;
        }

        .parametrsyields {
            order: 3;
            width: 100vw;
            overflow: scroll;
        }
    }

    .content.clear {
        display: flex;
        gap: 33px;
    }


    @media (max-width: 900px) {
        .content.clear {
            flex-direction: column;
        }

        .content.clear {
            gap: 0px;
        }

        table > *, table {
            width: max-content !important;
        }
    }

    .parametrs .item p:last-of-type {
        height: 22px;
    }

    .datepicker {
        padding: 4px;
        -webkit-border-radius: 4px;
        -moz-border-radius: 4px;
        border-radius: 4px;
        direction: ltr;
    }

    .datepicker-inline {
        width: 260px;
    }

    .datepicker.datepicker-rtl {
        direction: rtl;
    }

    .datepicker.datepicker-rtl table tr td span {
        float: right;
    }

    .datepicker-dropdown {
        top: 0;
        left: 0;
    }

    .datepicker-dropdown:before {
        content: '';
        display: inline-block;
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
        border-bottom: 7px solid #999999;
        border-top: 0;
        border-bottom-color: rgba(0, 0, 0, 0.2);
        position: absolute;
    }

    .datepicker-dropdown:after {
        content: '';
        display: inline-block;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 6px solid #ffffff;
        border-top: 0;
        position: absolute;
    }

    .datepicker-dropdown.datepicker-orient-left:before {
        left: 6px;
    }

    .datepicker-dropdown.datepicker-orient-left:after {
        left: 7px;
    }

    .datepicker-dropdown.datepicker-orient-right:before {
        right: 6px;
    }

    .datepicker-dropdown.datepicker-orient-right:after {
        right: 7px;
    }

    .datepicker-dropdown.datepicker-orient-bottom:before {
        top: -7px;
    }

    .datepicker-dropdown.datepicker-orient-bottom:after {
        top: -6px;
    }

    .datepicker-dropdown.datepicker-orient-top:before {
        bottom: -7px;
        border-bottom: 0;
        border-top: 7px solid #999999;
    }

    .datepicker-dropdown.datepicker-orient-top:after {
        bottom: -6px;
        border-bottom: 0;
        border-top: 6px solid #ffffff;
    }

    .datepicker > div {
        display: none;
    }

    .datepicker table {
        margin: 0;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .datepicker td,
    .datepicker th {
        text-align: center;
        width: 20px;
        height: 20px;
        -webkit-border-radius: 4px;
        -moz-border-radius: 4px;
        border-radius: 4px;
        border: none;
    }

    .table-striped .datepicker table tr td,
    .table-striped .datepicker table tr th {
        background-color: transparent;
    }

    .datepicker table tr td.day:hover,
    .datepicker table tr td.day.focused {
        background: #eeeeee;
        cursor: pointer;
    }

    .datepicker table tr td.old,
    .datepicker table tr td.new {
        color: #999999;
    }

    .datepicker table tr td.disabled,
    .datepicker table tr td.disabled:hover {
        background: none;
        color: #999999;
        cursor: default;
    }

    .datepicker table tr td.highlighted {
        background: #d9edf7;
        border-radius: 0;
    }

    .datepicker table tr td.today,
    .datepicker table tr td.today:hover,
    .datepicker table tr td.today.disabled,
    .datepicker table tr td.today.disabled:hover {
        background-color: #fde19a;
        background-image: -moz-linear-gradient(to bottom, #fdd49a, #fdf59a);
        background-image: -ms-linear-gradient(to bottom, #fdd49a, #fdf59a);
        background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#fdd49a), to(#fdf59a));
        background-image: -webkit-linear-gradient(to bottom, #fdd49a, #fdf59a);
        background-image: -o-linear-gradient(to bottom, #fdd49a, #fdf59a);
        background-image: linear-gradient(to bottom, #fdd49a, #fdf59a);
        background-repeat: repeat-x;
        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#fdd49a', endColorstr='#fdf59a', GradientType=0);
        border-color: #fdf59a #fdf59a #fbed50;
        border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
        filter: progid:DXImageTransform.Microsoft.gradient(enabled=false);
        color: #000;
    }

    .datepicker table tr td.today:hover,
    .datepicker table tr td.today:hover:hover,
    .datepicker table tr td.today.disabled:hover,
    .datepicker table tr td.today.disabled:hover:hover,
    .datepicker table tr td.today:active,
    .datepicker table tr td.today:hover:active,
    .datepicker table tr td.today.disabled:active,
    .datepicker table tr td.today.disabled:hover:active,
    .datepicker table tr td.today.active,
    .datepicker table tr td.today:hover.active,
    .datepicker table tr td.today.disabled.active,
    .datepicker table tr td.today.disabled:hover.active,
    .datepicker table tr td.today.disabled,
    .datepicker table tr td.today:hover.disabled,
    .datepicker table tr td.today.disabled.disabled,
    .datepicker table tr td.today.disabled:hover.disabled,
    .datepicker table tr td.today[disabled],
    .datepicker table tr td.today:hover[disabled],
    .datepicker table tr td.today.disabled[disabled],
    .datepicker table tr td.today.disabled:hover[disabled] {
        background-color: #fdf59a;
    }

    .datepicker table tr td.today:active,
    .datepicker table tr td.today:hover:active,
    .datepicker table tr td.today.disabled:active,
    .datepicker table tr td.today.disabled:hover:active,
    .datepicker table tr td.today.active,
    .datepicker table tr td.today:hover.active,
    .datepicker table tr td.today.disabled.active,
    .datepicker table tr td.today.disabled:hover.active {
        background-color: #fbf069 \9;
    }

    .datepicker table tr td.today:hover:hover {
        color: #000;
    }

    .datepicker table tr td.today.active:hover {
        color: #fff;
    }

    .datepicker table tr td.range,
    .datepicker table tr td.range:hover,
    .datepicker table tr td.range.disabled,
    .datepicker table tr td.range.disabled:hover {
        background: #eeeeee;
        -webkit-border-radius: 0;
        -moz-border-radius: 0;
        border-radius: 0;
    }

    .datepicker table tr td.range.today,
    .datepicker table tr td.range.today:hover,
    .datepicker table tr td.range.today.disabled,
    .datepicker table tr td.range.today.disabled:hover {
        background-color: #f3d17a;
        background-image: -moz-linear-gradient(to bottom, #f3c17a, #f3e97a);
        background-image: -ms-linear-gradient(to bottom, #f3c17a, #f3e97a);
        background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#f3c17a), to(#f3e97a));
        background-image: -webkit-linear-gradient(to bottom, #f3c17a, #f3e97a);
        background-image: -o-linear-gradient(to bottom, #f3c17a, #f3e97a);
        background-image: linear-gradient(to bottom, #f3c17a, #f3e97a);
        background-repeat: repeat-x;
        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#f3c17a', endColorstr='#f3e97a', GradientType=0);
        border-color: #f3e97a #f3e97a #edde34;
        border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
        filter: progid:DXImageTransform.Microsoft.gradient(enabled=false);
        -webkit-border-radius: 0;
        -moz-border-radius: 0;
        border-radius: 0;
    }

    .datepicker table tr td.range.today:hover,
    .datepicker table tr td.range.today:hover:hover,
    .datepicker table tr td.range.today.disabled:hover,
    .datepicker table tr td.range.today.disabled:hover:hover,
    .datepicker table tr td.range.today:active,
    .datepicker table tr td.range.today:hover:active,
    .datepicker table tr td.range.today.disabled:active,
    .datepicker table tr td.range.today.disabled:hover:active,
    .datepicker table tr td.range.today.active,
    .datepicker table tr td.range.today:hover.active,
    .datepicker table tr td.range.today.disabled.active,
    .datepicker table tr td.range.today.disabled:hover.active,
    .datepicker table tr td.range.today.disabled,
    .datepicker table tr td.range.today:hover.disabled,
    .datepicker table tr td.range.today.disabled.disabled,
    .datepicker table tr td.range.today.disabled:hover.disabled,
    .datepicker table tr td.range.today[disabled],
    .datepicker table tr td.range.today:hover[disabled],
    .datepicker table tr td.range.today.disabled[disabled],
    .datepicker table tr td.range.today.disabled:hover[disabled] {
        background-color: #f3e97a;
    }

    .datepicker table tr td.range.today:active,
    .datepicker table tr td.range.today:hover:active,
    .datepicker table tr td.range.today.disabled:active,
    .datepicker table tr td.range.today.disabled:hover:active,
    .datepicker table tr td.range.today.active,
    .datepicker table tr td.range.today:hover.active,
    .datepicker table tr td.range.today.disabled.active,
    .datepicker table tr td.range.today.disabled:hover.active {
        background-color: #efe24b \9;
    }

    .datepicker table tr td.selected,
    .datepicker table tr td.selected:hover,
    .datepicker table tr td.selected.disabled,
    .datepicker table tr td.selected.disabled:hover {
        background-color: #9e9e9e;
        background-image: -moz-linear-gradient(to bottom, #b3b3b3, #808080);
        background-image: -ms-linear-gradient(to bottom, #b3b3b3, #808080);
        background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#b3b3b3), to(#808080));
        background-image: -webkit-linear-gradient(to bottom, #b3b3b3, #808080);
        background-image: -o-linear-gradient(to bottom, #b3b3b3, #808080);
        background-image: linear-gradient(to bottom, #b3b3b3, #808080);
        background-repeat: repeat-x;
        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#b3b3b3', endColorstr='#808080', GradientType=0);
        border-color: #808080 #808080 #595959;
        border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
        filter: progid:DXImageTransform.Microsoft.gradient(enabled=false);
        color: #fff;
        text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
    }

    .datepicker table tr td.selected:hover,
    .datepicker table tr td.selected:hover:hover,
    .datepicker table tr td.selected.disabled:hover,
    .datepicker table tr td.selected.disabled:hover:hover,
    .datepicker table tr td.selected:active,
    .datepicker table tr td.selected:hover:active,
    .datepicker table tr td.selected.disabled:active,
    .datepicker table tr td.selected.disabled:hover:active,
    .datepicker table tr td.selected.active,
    .datepicker table tr td.selected:hover.active,
    .datepicker table tr td.selected.disabled.active,
    .datepicker table tr td.selected.disabled:hover.active,
    .datepicker table tr td.selected.disabled,
    .datepicker table tr td.selected:hover.disabled,
    .datepicker table tr td.selected.disabled.disabled,
    .datepicker table tr td.selected.disabled:hover.disabled,
    .datepicker table tr td.selected[disabled],
    .datepicker table tr td.selected:hover[disabled],
    .datepicker table tr td.selected.disabled[disabled],
    .datepicker table tr td.selected.disabled:hover[disabled] {
        background-color: #808080;
    }

    .datepicker table tr td.selected:active,
    .datepicker table tr td.selected:hover:active,
    .datepicker table tr td.selected.disabled:active,
    .datepicker table tr td.selected.disabled:hover:active,
    .datepicker table tr td.selected.active,
    .datepicker table tr td.selected:hover.active,
    .datepicker table tr td.selected.disabled.active,
    .datepicker table tr td.selected.disabled:hover.active {
        background-color: #666666 \9;
    }

    .datepicker table tr td.active,
    .datepicker table tr td.active:hover,
    .datepicker table tr td.active.disabled,
    .datepicker table tr td.active.disabled:hover {
        background-color: #006dcc;
        background-image: -moz-linear-gradient(to bottom, #0088cc, #0044cc);
        background-image: -ms-linear-gradient(to bottom, #0088cc, #0044cc);
        background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#0088cc), to(#0044cc));
        background-image: -webkit-linear-gradient(to bottom, #0088cc, #0044cc);
        background-image: -o-linear-gradient(to bottom, #0088cc, #0044cc);
        background-image: linear-gradient(to bottom, #0088cc, #0044cc);
        background-repeat: repeat-x;
        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#0088cc', endColorstr='#0044cc', GradientType=0);
        border-color: #0044cc #0044cc #002a80;
        border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
        filter: progid:DXImageTransform.Microsoft.gradient(enabled=false);
        color: #fff;
        text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
    }

    .datepicker table tr td.active:hover,
    .datepicker table tr td.active:hover:hover,
    .datepicker table tr td.active.disabled:hover,
    .datepicker table tr td.active.disabled:hover:hover,
    .datepicker table tr td.active:active,
    .datepicker table tr td.active:hover:active,
    .datepicker table tr td.active.disabled:active,
    .datepicker table tr td.active.disabled:hover:active,
    .datepicker table tr td.active.active,
    .datepicker table tr td.active:hover.active,
    .datepicker table tr td.active.disabled.active,
    .datepicker table tr td.active.disabled:hover.active,
    .datepicker table tr td.active.disabled,
    .datepicker table tr td.active:hover.disabled,
    .datepicker table tr td.active.disabled.disabled,
    .datepicker table tr td.active.disabled:hover.disabled,
    .datepicker table tr td.active[disabled],
    .datepicker table tr td.active:hover[disabled],
    .datepicker table tr td.active.disabled[disabled],
    .datepicker table tr td.active.disabled:hover[disabled] {
        background-color: #0044cc;
    }

    .datepicker table tr td.active:active,
    .datepicker table tr td.active:hover:active,
    .datepicker table tr td.active.disabled:active,
    .datepicker table tr td.active.disabled:hover:active,
    .datepicker table tr td.active.active,
    .datepicker table tr td.active:hover.active,
    .datepicker table tr td.active.disabled.active,
    .datepicker table tr td.active.disabled:hover.active {
        background-color: #003399 \9;
    }

    .datepicker table tr td span {
        display: block;
        width: 23%;
        height: 54px;
        line-height: 54px;
        float: left;
        margin: 1%;
        cursor: pointer;
        -webkit-border-radius: 4px;
        -moz-border-radius: 4px;
        border-radius: 4px;
    }

    .datepicker table tr td span:hover {
        background: #eeeeee;
    }

    .datepicker table tr td span.disabled,
    .datepicker table tr td span.disabled:hover {
        background: none;
        color: #999999;
        cursor: default;
    }

    .datepicker table tr td span.active,
    .datepicker table tr td span.active:hover,
    .datepicker table tr td span.active.disabled,
    .datepicker table tr td span.active.disabled:hover {
        background-color: #006dcc;
        background-image: -moz-linear-gradient(to bottom, #0088cc, #0044cc);
        background-image: -ms-linear-gradient(to bottom, #0088cc, #0044cc);
        background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#0088cc), to(#0044cc));
        background-image: -webkit-linear-gradient(to bottom, #0088cc, #0044cc);
        background-image: -o-linear-gradient(to bottom, #0088cc, #0044cc);
        background-image: linear-gradient(to bottom, #0088cc, #0044cc);
        background-repeat: repeat-x;
        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#0088cc', endColorstr='#0044cc', GradientType=0);
        border-color: #0044cc #0044cc #002a80;
        border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
        filter: progid:DXImageTransform.Microsoft.gradient(enabled=false);
        color: #fff;
        text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
    }

    .datepicker table tr td span.active:hover,
    .datepicker table tr td span.active:hover:hover,
    .datepicker table tr td span.active.disabled:hover,
    .datepicker table tr td span.active.disabled:hover:hover,
    .datepicker table tr td span.active:active,
    .datepicker table tr td span.active:hover:active,
    .datepicker table tr td span.active.disabled:active,
    .datepicker table tr td span.active.disabled:hover:active,
    .datepicker table tr td span.active.active,
    .datepicker table tr td span.active:hover.active,
    .datepicker table tr td span.active.disabled.active,
    .datepicker table tr td span.active.disabled:hover.active,
    .datepicker table tr td span.active.disabled,
    .datepicker table tr td span.active:hover.disabled,
    .datepicker table tr td span.active.disabled.disabled,
    .datepicker table tr td span.active.disabled:hover.disabled,
    .datepicker table tr td span.active[disabled],
    .datepicker table tr td span.active:hover[disabled],
    .datepicker table tr td span.active.disabled[disabled],
    .datepicker table tr td span.active.disabled:hover[disabled] {
        background-color: #0044cc;
    }

    .datepicker table tr td span.active:active,
    .datepicker table tr td span.active:hover:active,
    .datepicker table tr td span.active.disabled:active,
    .datepicker table tr td span.active.disabled:hover:active,
    .datepicker table tr td span.active.active,
    .datepicker table tr td span.active:hover.active,
    .datepicker table tr td span.active.disabled.active,
    .datepicker table tr td span.active.disabled:hover.active {
        background-color: #003399 \9;
    }

    .datepicker table tr td span.old,
    .datepicker table tr td span.new {
        color: #999999;
    }

    .datepicker .datepicker-switch {
        width: 145px;
    }

    .datepicker .datepicker-switch,
    .datepicker .prev,
    .datepicker .next,
    .datepicker tfoot tr th {
        cursor: pointer;
    }

    .datepicker .datepicker-switch:hover,
    .datepicker .prev:hover,
    .datepicker .next:hover,
    .datepicker tfoot tr th:hover {
        background: #eeeeee;
    }

    .datepicker .cw {
        font-size: 10px;
        width: 12px;
        padding: 0 2px 0 5px;
        vertical-align: middle;
    }

    .input-append.date .add-on,
    .input-prepend.date .add-on {
        cursor: pointer;
    }

    .input-append.date .add-on i,
    .input-prepend.date .add-on i {
        margin-top: 3px;
    }

    .input-daterange input {
        text-align: center;
    }

    .input-daterange input:first-child {
        -webkit-border-radius: 3px 0 0 3px;
        -moz-border-radius: 3px 0 0 3px;
        border-radius: 3px 0 0 3px;
    }

    .input-daterange input:last-child {
        -webkit-border-radius: 0 3px 3px 0;
        -moz-border-radius: 0 3px 3px 0;
        border-radius: 0 3px 3px 0;
    }

    .input-daterange .add-on {
        display: inline-block;
        width: auto;
        min-width: 16px;
        height: 18px;
        padding: 4px 5px;
        font-weight: normal;
        line-height: 18px;
        text-align: center;
        text-shadow: 0 1px 0 #ffffff;
        vertical-align: middle;
        background-color: #eeeeee;
        border: 1px solid #ccc;
        margin-left: -5px;
        margin-right: -5px;
    }

    .parametrs .item {
        /*display: flex;*/
    }

    .nvd3 .nv-axis.nv-x path.domain {
        stroke-opacity: 1 !important;
    }

    .cw {
        display: none;
    }

    svg {
        height: 400px !important;
    }

    .color {
        width: 1px;
        height: 5px;
        overflow: hidden;
    }

    .date {
        display: flex;
        gap: 2px;
        align-items: center;
    }

    .tooltip_from_nv {
        padding: 2px;
    }

    .datepick {
        margin-top: 230px;
    }

    @media (max-width: 900px) {
        .datepick {
            margin-top: 0px;
            height: 246px;
        }
    }

    .datepick * {
        opacity: 0;
    }

    .chart_more_data {
        display: flex;
        flex-wrap: wrap;
    }

    @media (max-width: 900px) {
        .chart_more_data {
            flex-direction: column;
            position: relative;
        }


    }

    .parametrs {
        width: 150px;
        background: rgba(127, 127, 127, 0.2);
        padding: 8px 0;
        /*border:1px solid black;*/
        border-radius: 4px;
    }

    @media (max-width: 900px) {
        .parametrs {
            width: 100%;
        }
    }

    .parametrs h2 {
        font-size: 14px;
        font-weight: unset;
        text-align: center;
        text-decoration: underline;
        margin-bottom: 10px;
    }

    .parametrs .item:not(:last-of-type) {
        margin-bottom: 8px;
    }

    .parametrs .item p:first-of-type {
        font-size: 12px;
        padding: 0 8px;
    }

    .parametrs .item p:last-of-type {
        font-size: 12px;
        padding: 4px 12px;
        background: rgba(127, 127, 127, 0.2);
        margin-top: 4px;
    }

    .parametrsyields {
        /*margin-left: 30px;*/
        width: 100%;
        flex-basis: 100%;
        margin-top: 24px;
    }

    @media (max-width: 900px) {
        .parametrsyields {
            margin-left: 0px;
            margin-top: 24px;
            margin-bottom: 24px;
        }

        .download_button button {
            margin-left: 0px !important;
        }

        .parametrs {
            margin-top: 24px;
        }
    }

    .parametrsyields .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .parametrsyields .item p:last-of-type {
        padding-left: 0px;
        padding-top: 0px;
        padding-bottom: 0px;
        background: transparent;
    }

    .table-condensed {
        background: transparent !important;
        border: 1px solid black !important;
        border-radius: 5px;
    }

    @media (min-width: 900px) {
        #datepicker-container {
            flex: 0 0 250px !important;
            margin-right: 24px;
            margin-right: 24px;
        }
    }

    .modal {
        position: fixed;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, .8);
        width: 100vw;
        height: 100vh;
        z-index: 99999;
        display: none;
        align-items: center;
        justify-content: center;
    }

    .download_file {
        background: rgba(127, 127, 127, 1);
        padding: 14px;
        border-radius: 4px;
        margin-left: 24px;
        border: 1px solid black;
    }

    .modal a {
        color: white;
    }
</style>


<div class="content_wrap">
    <div class="container">
        <div class="content clear">

            <div class=" clear inner">
                <div class="content_title"><?= Yii::t('app', 'Gəlirlilik əyrisi') ?>
                    <div id="controls"><a href="javascript:" id="small" class="letter minus">A<span class="resize-icon">-</span></a><a href="javascript:" id="medium" class="letter plus">A<span class="resize-icon">+</span></a></div>
                </div>
                <div class="social_icons">
                    <div><a href="mailto:?subject=Azərbaycan Respublikasının Mərkəzi Bankı | Kommunikasiya&amp;body=https://test.cbar.az/page-56/communication" class="hint--bottom hint--bounce hvr_float" aria-label="Email"><img src="../images/icons/mail.svg" alt=""></a><a href="https://www.linkedin.com/sharing/share-offsite/?url=https://test.cbar.az/page-56/communication" target="_blank" class="hvr_float hint--bottom hint--bounce" aria-label="LinkedIn"><img src="../images/icons/linkedin.svg"></a><a href="https://www.facebook.com/sharer/sharer.php?u=https://test.cbar.az/page-56/communication" target="_blank" class="hint--bottom hint--bounce hvr_float" aria-label="Facebook"><img src="../images/icons/facebook.svg" alt=""></a><a href="https://twitter.com/intent/tweet?url=https://test.cbar.az/page-56/communication" target="_blank" class="hint--bottom hint--bounce hvr_float" aria-label="Twitter"><img src="../images/icons/twitter.svg" alt=""></a><a
                                href="whatsapp://send?text=https://test.cbar.az/page-56/communication" class="hint--bottom hint--bounce hvr_float" aria-label="WhatsApp"><img src="../images/icons/whatsapp.svg" alt=""></a></div>
                    <a href="javascript:;" id="print-page2" class="hint--right hint--bounce print_btn" aria-label="print"></a></div>
                <div id="pages-gallery" class="type_text pages-gallery">


                    <div id="yieldCurveChart" style="height: 400px">
                        <svg></svg>
                    </div>


                    <div class="chart_more_data">
                        <div id="datepicker-container"></div>
                        <div class="parametrs">
                            <h2><?= Yii::t('app', 'Parameters') ?></h2>
                            <div class="item">
                                <p><?= Yii::t('app', 'Tarix') ?> </p>
                                <p id="">
                                    <?= join('/', array_reverse(explode('-', $day))) ?>
                                </p>
                            </div>
                            <div class="item">
                                <p>Beta0</p>
                                <p id="beta0"></p>
                            </div>
                            <div class="item">
                                <p>Beta1</p>
                                <p id="beta1"></p>
                            </div>
                            <div class="item">
                                <p>Beta2</p>
                                <p id="beta2"></p>
                            </div>
                            <div class="item">
                                <p>Lambda</p>
                                <p id="tau"></p>
                            </div>
                        </div>


                        <div class="download_button">
                            <button style="background: rgba(127, 127, 127, 0.2); padding: 14px; border-radius: 4px; margin-left: 24px; border:1px solid black;"><?= Yii::t('app', 'download data') ?></button>
                        </div>
                        <div class="parametrs parametrsyields">
                            <h2><?= Yii::t('app', 'Yields') ?> % </h2>


                            <style>
                                table {
                                    background: transparent !important;
                                    border-collapse: collapse !important;
                                }

                                table thead th {
                                    padding: 8px !important;
                                    font-size: 14px !important;
                                    font-weight: normal !important;
                                }

                                table tbody tr td {
                                    border: unset !important;
                                    padding: 8px !important;
                                    text-align: center;

                                }

                                table tbody tr, table thead {
                                    border-bottom: 1px solid #fff;
                                }

                                table tbody tr:last-of-type {
                                    border-bottom: unset;

                                }

                                .parametrsyields tr:hover {
                                    background: #cbcaca;
                                }
                            </style>

                            <table>
                                <thead>
                                <tr>
                                    <th><?= Yii::t('app', 'Tarix') ?></th>
                                    <th><?= Yii::t('app', '3 ay') ?></th>
                                    <th><?= Yii::t('app', '6 ay') ?></th>
                                    <th><?= Yii::t('app', '9 ay') ?></th>
                                    <th><?= Yii::t('app', '1 il') ?></th>
                                    <th><?= Yii::t('app', '2 il') ?></th>
                                    <th><?= Yii::t('app', '3 il') ?></th>
                                    <th><?= Yii::t('app', '4 il') ?></th>
                                </tr>

                                </thead>
                                <tbody>

                                </tbody>
                            </table>
                            <!--                        <div class="item">-->
                            <!--                            <p>--><?php //= Yii::t('app', 'Date')?><!--</p>-->
                            <!--                            <p id="">-->
                            <!--                                %-->
                            <!--                            </p>-->
                            <!--                        </div>-->
                            <!--                        <div class="item">-->
                            <!--                            <p>--><?php //= Yii::t('app', '3 ay')?><!--</p>-->
                            <!--                            <p id="ay3">-->
                            <!--                            </p>-->
                            <!--                        </div>-->
                            <!--                        <div class="item">-->
                            <!--                            <p>--><?php //= Yii::t('app', '6 ay')?><!--</p>-->
                            <!--                            <p id="ay6">-->
                            <!--                            </p>-->
                            <!--                        </div>-->
                            <!--                        <div class="item">-->
                            <!--                            <p>--><?php //= Yii::t('app', '9 ay')?><!--</p>-->
                            <!--                            <p id="ay9">-->
                            <!--                            </p>-->
                            <!--                        </div>-->
                            <!--                        <div class="item">-->
                            <!--                            <p>--><?php //= Yii::t('app', '1 il')?><!--</p>-->
                            <!--                            <p id="il1">-->
                            <!--                            </p>-->
                            <!--                        </div>-->
                            <!--                        <div class="item">-->
                            <!--                            <p>--><?php //= Yii::t('app', '2 il')?><!--</p>-->
                            <!--                            <p id="il2">-->
                            <!--                            </p>-->
                            <!--                        </div>-->
                            <!--                        <div class="item">-->
                            <!--                            <p>--><?php //= Yii::t('app', '3 il')?><!--</p>-->
                            <!--                            <p id="il3">-->
                            <!--                            </p>-->
                            <!--                        </div>-->
                            <!--                        <div class="item">-->
                            <!--                            <p>--><?php //= Yii::t('app', '4 il')?><!-- </p>-->
                            <!--                            <p id="il4">-->
                            <!--                            </p>-->
                            <!--                        </div>-->
                            <!--                        <div class="item">-->
                            <!--                            <p>--><?php //= Yii::t('app', '5 il')?><!--</p>-->
                            <!--                            <p id="il5">-->
                            <!--                            </p>-->
                            <!--                        </div>-->
                        </div>


                        <?php if (Yii::$app->language == 'az') : ?>
                            <a target="_blank" href="https://uploads.cbar.az/assets/9459f5babcf1158b0a512f5ff.pdf" style="margin-top:24px; color:blue;" href=""><?= Yii::t('app', 'Gəlirlilik əyrisinin metodoloji izahı') ?></a>
                        <?php else: ?>
                            <a target="_blank" href="https://uploads.cbar.az/assets/Methodological%20explanation_yield%20curve_KR_IH_FINAL.pdf" style="margin-top:24px; color:blue;" href=""><?= Yii::t('app', 'Gəlirlilik əyrisinin metodoloji izahı') ?></a>
                        <?php endif; ?>


                    </div>
                </div>

            </div>
        </div>
    </div>
</div>
</div>


<div class="modal">
    <div class="download_file">
        <a href="/download.xlsx"><?= Yii::t('app', 'Download File') ?> </a>
    </div>
</div>

<script>

    function printDiv(divName) {
        var originalContents = document.body.innerHTML;

        $(".datepicker").remove();
        $("aside").remove();
        $(".parametrs h2").remove();
        $("header").remove();
        $(".top_image_wrap").remove();
        $(".nav_wrap").remove();
        $("footer").remove();
        $(".content_title").remove();
        $(".social_icons").remove();
        $(".slider_block_wrap").remove();
        $(".parametrs .item").remove();
        $(".download_button").remove();
        var printContents = $('html').html();

        document.body.innerHTML = printContents;

        window.print();

        document.body.innerHTML = originalContents;
    }

    $("body").on('click', '#print-page2', function () {
        printDiv();
    });
    $("body").on('click', '.download_button', function () {
        $.ajax({
            url: '/home/downloaddata',
            type: 'get',
            data: {dates: $("#input").val()},
            success: function (e) {
                $(".modal").css({
                    'display': 'flex'
                })
            },
            error: function (e) {
                // console.log(e);
            }
        })
    });

    chartYaz(JSON.parse('<?=json_encode($yield_params)?>'), '<?=$day?>');

    $("body").on('click', '.download_file', function () {
        $(".modal").hide();
    });

    function chartYaz(data, day) {
        var html = '';
        html += '<tr>';
        html += '<td style="text-decoration: underline">' + day + '</td>';
        html += '<td>' + data[0] + '</td>';
        html += '<td>' + data[1] + '</td>';
        html += '<td>' + data[2] + '</td>';
        html += '<td>' + data[3] + '</td>';
        html += '<td>' + data[4] + '</td>';
        html += '<td>' + data[5] + '</td>';
        html += '<td>' + data[6] + '</td>';
        html += '</tr>';
        $(".parametrsyields tbody").append(html);
    }

    function chartYazAjax(data) {
        var html = '';
        for (a in data) {


            html += '<tr>';

            html += '<td style="text-decoration: underline">' + a + '</td>';

            html += '<td>' + data[a]['three_month'] + '</td>';
            html += '<td>' + data[a]['six_month'] + '</td>';
            html += '<td>' + data[a]['nine_month'] + '</td>';
            html += '<td>' + data[a]['one_year'] + '</td>';
            html += '<td>' + data[a]['two_year'] + '</td>';
            html += '<td>' + data[a]['three_year'] + '</td>';
            html += '<td>' + data[a]['four_year'] + '</td>';

            html += '</tr>';

        }
        $(".parametrsyields tbody").html('');

        $(".parametrsyields tbody").append(html);

    }

    var arr = <?=json_encode($get_current_day_datas)?>;

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return '#4BC7B5';
    }

    function generateData(arr, day) {
        var data = [];
        for (a in arr) {
            data.push({
                x: arr[a][1],
                y: arr[a][2],
            });
        }
        return {
            values: data,
            key: day,
            color: getRandomColor()
        };
    }


    let chart = nv.models.lineChart();
    // .margin({left: 100});
    var datas = [];
    nv.addGraph(function () {
        if ($(window).width() < 900) {
            var days = {30: "<?= Yii::t('app', '1 ay')?> ", 365: "<?= Yii::t('app', '1 il')?>", 1096: "<?= Yii::t('app', '3 il')?>", 1460: "<?= Yii::t('app', '4 il')?>", 1800: "<?= Yii::t('app', '5 il')?>"};
        } else {
            var days = {30: "<?= Yii::t('app', '1 ay')?> ", 90: "<?= Yii::t('app', '3 ay')?> ", 180: "<?= Yii::t('app', '6 ay')?>", 270: "<?= Yii::t('app', '9 ay')?>", 365: "<?= Yii::t('app', '1 il')?>", 730: "<?= Yii::t('app', '2 il')?>", 1096: "<?= Yii::t('app', '3 il')?>", 1460: "<?= Yii::t('app', '4 il')?>", 1800: "<?= Yii::t('app', '5 il')?>"};
        }
        chart.xAxis.axisLabel('<?= Yii::t('app', 'müddət')?>').tickValues([90, 180, 270, 365, 730, 1096, 1460, 1800])
            .tickFormat(function (d) {
                return days[d];
            });
        chart.yAxis
            .axisLabel('<?= Yii::t('app', 'gəlirlilik')?> ').tickValues([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 30])
            .tickFormat(d3.format(''));

        chart.xAxis.showMaxMin(true);
        chart.showLegend(true);
        chart.useInteractiveGuideline(true);
        chart.forceY([0, 16]);
        chart.forceX([0, 1600]);
        datas.push(generateData(arr, '<?=$day?>'));
        var tooltip = chart.interactiveLayer.tooltip;
        tooltip.contentGenerator(function (key, x, y, e, graph) {
            var html = '';
            var d = days[key.series[0]['data']['x']];
            if (d == undefined) {
                d = key.series[0].data.x + ' <?= Yii::t('app', 'days')?>';
            }
            html += '<div class="tooltip_from_nv"><p><strong>' + d + ' </strong></p>' +
                '<div class="date"><p class="color" style="background: ' + key.series[0].color + '"></p>' +
                '<p >' + key.series[0]['key'] + '</p>' +
                '<p class="val">' + parseFloat(key.series[0]['data']['y']).toFixed(2) + '</p>' +
                '</div></div>'
            ;
            return html;
        });
        d3.select('#yieldCurveChart svg')
            .datum(datas)
            .transition().duration(500)
            .call(chart);
        nv.utils.windowResize(function () {
            chart.update()
        });

        // Скрываем тултип при скролле (особенно актуально для мобильных)
        $(window).scroll(function() {
            if (chart && chart.interactiveLayer && chart.interactiveLayer.tooltip) {
                chart.interactiveLayer.tooltip.hidden(true);
            }
        });

        // Скрываем тултип при клике вне графика
        $(document).on('mousedown touchstart', function(e) {
            if (!$(e.target).closest('#yieldCurveChart').length) {
                if (chart && chart.interactiveLayer && chart.interactiveLayer.tooltip) {
                    chart.interactiveLayer.tooltip.hidden(true);
                }
            }
        });

        return chart;
    });

    $.fn.datepicker.dates['az'] = {
        days: ["Bazar", "Bazar Ertəsi", "Çərşənbə Axşamı", "Çərşənbə", "Cümə Axşamı", "Cümə", "Şənbə"],
        daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        daysMin: ["B", "BE", "ÇA", "Ç", "CA", "C", "Ş"],
        months: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"],
        monthsShort: ["Yan", "Fev", "Mar", "Apr", "May", "İyun", "İyul", "Avq", "Sen", "Okt", "Noy", "Dek"],
        today: "Today",
        clear: "Clear",
        format: "mm/dd/yyyy",
        titleFormat: "MM yyyy", /* Leverages same syntax as 'format' */
        weekStart: 0,
        dateFormat: 'dd-mm-yy'
    };
    var dates = '<?=json_encode($dates)?>';
    dates = JSON.parse(dates);
    $('#datepicker-container').datepicker({
        format: 'yyyy-mm-dd',
        multidate: true,
        calendarWeeks: true,
        language: '<?=Yii::$app->language?>',
        sideBySide: true,
        beforeShowDay: function (date) {
            currentDate = moment(date).format('YYYY-MM-DD');

            return dates.includes(currentDate);
        },
        //daysOfWeekDisabled: '0,2,3,4,5,6', // Pazartesi hariç diğer günleri devre dışı bırak
    });
    $('#datepicker-container').datepicker('setDate', '<?=$day?>');

    function updateChartWithThirdGraph(datalar) {
        d3.select('#yieldCurveChart svg').remove();
        nv.addGraph(function () {
            var chart = nv.models.lineChart();
            if ($(window).width() < 900) {
                var days = {30: "<?= Yii::t('app', '1 ay')?> ", 365: "<?= Yii::t('app', '1 il')?>", 1096: "<?= Yii::t('app', '3 il')?>", 1460: "<?= Yii::t('app', '4 il')?>", 1800: "<?= Yii::t('app', '5 il')?>"};

            } else {
                var days = {30: "<?= Yii::t('app', '1 ay')?> ", 90: "<?= Yii::t('app', '3 ay')?> ", 180: "<?= Yii::t('app', '6 ay')?>", 270: "<?= Yii::t('app', '9 ay')?>", 365: "<?= Yii::t('app', '1 il')?>", 730: "<?= Yii::t('app', '2 il')?>", 1096: "<?= Yii::t('app', '3 il')?>", 1460: "<?= Yii::t('app', '4 il')?>", 1800: "<?= Yii::t('app', '5 il')?>"};

            }
            chart.xAxis.axisLabel('<?= Yii::t('app', 'müddət')?>').tickValues([90, 180, 270, 365, 730, 1096, 1460, 1800])
                .tickFormat(function (d) {
                    return days[d];
                });
            chart.yAxis
                .axisLabel('<?= Yii::t('app', 'gəlirlilik')?>').tickValues([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30])
                .tickFormat(d3.format(''));
            chart.xAxis.showMaxMin(true);
            d3.select('#yieldCurveChart')
                .append('svg')
                .datum(datalar)
                .transition()
                .duration(500)
                .call(chart);
            chart.showLegend(true);
            chart.useInteractiveGuideline(true);
            chart.forceY([0, 14]);
            chart.forceX([0, 1600]);
            var tooltip = chart.interactiveLayer.tooltip;
            tooltip.contentGenerator(function (key, x, y, e, graph) {
                var html = '';
                for (var a in key.series) {
                    var d = days[key.series[a]['data']['x']];
                    if (d == undefined) {
                        d = key.series[a].data.x + ' <?= Yii::t('app', 'days')?>';
                    }
                    html += '<div class="tooltip_from_nv"><p><strong>' + d + ' </strong></p>' +
                        '<div class="date"><p class="color" style="background: ' + key.series[a].color + '"></p>' +
                        '<p >' + key.series[a]['key'] + '</p>' +
                        '<p class="val">' + parseFloat(key.series[a]['data']['y']).toFixed(2) + '</p>' +
                        '</div></div>'
                    ;
                }
                return html;
            });
            chart.update();
            nv.utils.windowResize(function () {
                chart.update();
            });

            // Скрываем тултип при скролле (особенно актуально для мобильных)
            $(window).scroll(function() {
                if (chart && chart.interactiveLayer && chart.interactiveLayer.tooltip) {
                    chart.interactiveLayer.tooltip.hidden(true);
                }
            });

            // Скрываем тултип при клике вне графика
            $(document).on('mousedown touchstart', function(e) {
                if (!$(e.target).closest('#yieldCurveChart').length) {
                    if (chart && chart.interactiveLayer && chart.interactiveLayer.tooltip) {
                        chart.interactiveLayer.tooltip.hidden(true);
                    }
                }
            });

            return chart;
        });
    }

    params = '<?=json_encode($params)?>';
    params = JSON.parse(params);
    $("#beta0").text(params['beta_0']);
    $("#beta1").text(params['beta_1']);
    $("#beta2").text(params['beta_2']);
    $("#tau").text(params['lambda']);
    $('#datepicker-container').on('changeDate', function (e) {
        var secilenTarih = e.format('yyyy-mm-dd');
        values = [];
        for (a in e.dates) {
            var formattedDate = moment(e.dates[a]).format('YYYY-MM-DD');
            values.push(formattedDate);
        }
        values_dates = values.join(',');
        $.ajax({
            url: '/home/yield',
            data: {name: values_dates, 'secilenTarih': secilenTarih},
            type: "GET",
            success: function (e) {
                e = JSON.parse(e);
                console.log(e);
                updateChartWithThirdGraph(e.yield);
                if (e.params == null) {
                    $("#beta0").text('');
                    $("#beta1").text('');
                    $("#beta2").text('');
                    $("#tau").text('');
                }
                if (e.yyields == null) {
                    $(".parametrsyields #ay3").text('');
                    $(".parametrsyields #ay6").text('');
                    $(".parametrsyields #ay9").text('');
                    $(".parametrsyields #il1").text('');
                    $(".parametrsyields #il2").text('');
                    $(".parametrsyields #il3").text('');
                    $(".parametrsyields #il4").text('');
                    $(".parametrsyields #il5").text('');
                }
                $("#beta0").text(e.params['beta_0']);
                $("#beta1").text(e.params['beta_1']);
                $("#beta2").text(e.params['beta_2']);
                $("#tau").text(e.params['lambda']);
                $(".parametrs:not(.parametrsyields) .item:first-of-type p:last-of-type").text(secilenTarih.split("-").reverse().join("/"));
                chartYazAjax(e.yyields);
            },
            error: function (e) {
                $("#beta0").text('');
                $("#beta1").text('');
                $("#beta2").text('');
                $("#tau").text('');
                $(".parametrsyields #ay3").text('');
                $(".parametrsyields #ay6").text('');
                $(".parametrsyields #ay9").text('');
                $(".parametrsyields #il1").text('');
                $(".parametrsyields #il3").text('');
                $(".parametrsyields #il4").text('');
                $(".parametrsyields #il5").text('');
            }
        });
    });
</script>

