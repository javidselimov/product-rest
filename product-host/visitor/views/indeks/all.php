<?

/* Trash from Safaroff */


/* @var $this \yii\web\View
 * @var $formModel visitor\viewmodels\CurrencyRatesViewModel
 * @var $model visitor\viewmodels\CurrencyRatesViewModel
 */

use yii\helpers\Url;
use common\helpers\DateHelper;
use visitor\helpers\HtmlHelper;

$this->title = Yii::t('app', 'AZIR İNDEKSLƏRİ');
$new_date = date('Y-m-d', strtotime($new_date));
$xmlDate = $new_date;

?>

<style>
    .kod_title, .kurs_title {
        text-align: left;
    }

    .valuta_title {
        font-size: 15px !important;
    }

    .kurs_title {
        width: 25%;
    }
</style>


<?php


$new_date = $new_date . ' 00:00:00';

$connection = Yii::$app->db;
$command = $connection->createCommand("select * from azir_indexses");
$result_ana = $command->queryAll();

$arrays_dates = array_map(function ($item) {
    return $item['date'];
}, $result_ana);

$result = array_filter($result_ana, function ($item) use ($xmlDate) {
    return $item['date'] == $xmlDate;
});

if (count($result) == 0) {
    Yii::$app->response->redirect(['/']);
}

usort($result, function ($a, $b) {
    return $a['order_column'] - $b['order_column'];
});


$new_date = $result[0]['date'];

?>
<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('//layouts/menu/left') ?></aside>
            <div class="content_content clear inner">
                <div class="content_title"><a href="javascript::void(0);"><? echo $this->title ?></a></div>
                <div class="table_wrap">
                    <div class="table_body">
                        <div class="table_title">
                            <div></div>
                            <div class="date_select">
                                <input type="text" class="date-current white_date" data-pmu-locale="<? echo Yii::$app->language ?>" data-pmu-date="<? echo date('d.m.Y', strtotime($new_date)) ?>" data-pmu-format="d/m/Y">
                            </div>
                        </div>
                    </div>
                    <div class="table_content">
                        <div class="table_table">
                            <div class="valuta_title">
                                <div class="kurs_title"><? echo Yii::t('app', 'Ad') ?></div>
                                <div class="kurs_title"><? echo Yii::t('app', 'Faiz') ?></div>
                                <div class="kurs_title"><? echo Yii::t('app', 'Əqdlərin həcmi') ?></div>
                                <div class="kurs_title"><? echo Yii::t('app', 'Əqdlərin sayı') ?></div>
                            </div>
                            <div class="table_items">
                                <? foreach ($result as $code => $title): ?>
                                    <div class="table_row">
                                        <div class="valuta"><? echo $title['title_' . Yii::$app->language] ?></div>
                                        <?php if ($title['faiz_' . Yii::$app->language] >= 0.01): ?>
                                            <div class="valuta"><? echo $title['faiz_' . Yii::$app->language] ?>%</div>
                                        <?php else: ?>
                                            <div class="valuta">-</div>
                                        <?php endif; ?>
                                        <?php if ($title['eqd_hecm_' . Yii::$app->language] >= 0.01): ?>
                                            <div class="valuta"><? echo $title['eqd_hecm_' . Yii::$app->language] ?></div>
                                        <?php else: ?>
                                            <div class="valuta">-</div>
                                        <?php endif; ?>
                                        <?php if ($title['eqd_say_' . Yii::$app->language] >= 0.01): ?>
                                            <div class="valuta"><? echo $title['eqd_say_' . Yii::$app->language] ?></div>
                                        <?php else: ?>
                                            <div class="valuta">-</div>
                                        <?php endif; ?>
                                    </div>
                                <? endforeach; ?>
                            </div>
                        </div>
                        <br>
                        <? if ($settings['value'] == 1): ?>
                            <p class="emo"><?= Yii::t('other', '* əvvəlki günün indeksinə bərabər götürülmüşdür.') ?></p>
                        <? endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>