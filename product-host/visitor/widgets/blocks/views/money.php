<?php


$check_bu_gun = array_filter($data, function ($da) {

    return $da['home_view'] == 1;
});


usort($check_bu_gun, function ($a, $b) {
    return $a['order_column'] - $b['order_column'];
});

//array_multisort(array_column($check_bu_gun, 'order_column'), SORT_ASC, $check_bu_gun);

$new_date = array_filter($data, function ($da) {

    return $da['date_view'] == 1;
});
$new_date = array_values($new_date);


$new_date = date('d.m.Y', strtotime($new_date[0]['date']));


?>

<p>
    <?php if (Yii::$app->language == 'az'): ?>
        <?= $new_date ?> tarixinə AZIR İNDEKSLƏRİ
    <?php elseif (Yii::$app->language == 'en'): ?>
        AZIR indices as of <?= $new_date ?>
    <?php endif; ?>


</p>
<style>
    .tablesss {
        margin-top: 12px;
        border-collapse: collapse;
        border-radius: 5px;
        width: 100%;
    }

    .emo {
        font-style: italic;
        font-size: 13px;
    }

    .tablesss th, td {
        font-size: 13px;
        border-collapse: collapse;
        box-sizing: border-box;

    }

    .tablesss th {
        background-color: #1c3550;
        width: 25%;
        font-family: 'Fira Sans', sans-serif;
        color: white;
        border-color: transparent;
        font-weight: 300;
        word-break: break-word;
    }

    .tablesss td, .tablesss th {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 5px;
    }

    .tablesss, .tablesss th, .tablesss td {
        border: .4px solid black;
        border-collapse: collapse;
        font-family: 'Fira Sans', sans-serif;
    }

    .tablesss tr {

        display: flex;

    }

    .tablesss td {
        width: 25%;
    }
</style>
<table class="tablesss">
    <thead>
    <tr>
        <th><?= Yii::t('other', 'Ad') ?></th>
        <th><?= Yii::t('other', 'Faiz') ?></th>
        <th style="font-size: 11px"><?= Yii::t('other', 'Əqdlərin həcmi') ?></th>
        <th><?= Yii::t('other', 'Əqdlərin sayı') ?></th>
    </tr>
    </thead>
    <tbody>


    <?php if (count($check_bu_gun) > 0): ?>
        <?php foreach ($check_bu_gun as $da): ?>
            <tr>
                <td style="font-size: 12px;"><?= $da['title_' . Yii::$app->language] ?></td>
                <?php if ($da['faiz_' . Yii::$app->language] >= 0.01): ?>
                    <td><?= $da['faiz_' . Yii::$app->language] ?>%</td>
                <?php else: ?>
                    <td>-</td>
                <?php endif; ?>
                <?php if ($da['eqd_hecm_' . Yii::$app->language] >= 0.01): ?>
                    <td><?= $da['eqd_hecm_' . Yii::$app->language] ?></td>
                <?php else: ?>
                    <td>-</td>
                <?php endif; ?>
                <?php if ($da['eqd_say_' . Yii::$app->language] >= 0.01): ?>
                    <td><?= $da['eqd_say_' . Yii::$app->language] ?></td>
                <?php else: ?>
                    <td>-</td>
                <?php endif; ?>
            </tr>
        <?php endforeach; ?>
    <?php endif; ?>
    </tbody>
</table>


<?php
$connection = Yii::$app->db;


try {
    $command = $connection->createCommand("
    SELECT * FROM settings_saf where key='show_before_day';
");
    $res = $command->queryAll();
} catch (Exception $e) {
    $res = false;
}


?>

<br>
<?php if (array_values($res)[0]['value']) : ?>
    <p class="emo"><?= Yii::t('other', '* əvvəlki günün indeksinə bərabər götürülmüşdür.') ?></p>
    <br>
<?php endif; ?>


<p class="emo"><?= Yii::t('other', 'AZIR (Azerbaijan Interbank Rate) - Blumberq platformasında banklar arasında milli valyutada bağlanan əqdlərin ortaçəkili faiz dərəcəsini əks etdirən müxtəlif müddətli indekslərdir.') ?></p>
<br>
<div class="blue_btn" style="cursor: pointer;" onclick="window.location.href='/indeks/all?language=<?= Yii::$app->language ?>&date=<?= date('d/m/Y', strtotime($new_date)) ?>'"><?= Yii::t('app', 'Hamısına Keçid') ?></div>
