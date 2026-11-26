<?

/* Trash from Safaroff */


/* @var $this \yii\web\View
 * @var $model visitor\viewmodels\IndeksRatesViewModel
 * @var $azirStats visitor\viewmodels\IndeksRatesViewModel
 * @var $azirTable visitor\viewmodels\IndeksRatesViewModel
 */

use common\helpers\DateHelper;
use yii\helpers\Url;

$this->title = Yii::t('app', 'AZIR İNDEKSLƏRİ');
?>

<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('//layouts/menu/left') ?></aside>
            <div class=" clear inner">
                <div class="content_title"><a href="<?php echo Url::to(['indeks/rates']) ?>"><? echo $this->title ?></a></div>

                <div class="type_text pages-gallery">
                    <h4 class="text-center"><?= Yii::t('app', 'AZIR Chart Title') ?></h4>
                    <br>
                    <div style="height: 400px; position: relative;">
                        <canvas id="money-market-chart-new"></canvas>
                    </div>
                    <div class="alert warning">
                        <?= Yii::t('app', 'AZIR Chart Alert') ?>
                    </div>
                    <br>
                    <div class="table_title">
                        <div>
                            <a class="button" href="<? echo Url::current(['export' => 'true']) ?>" style="opacity: 1;"><?= Yii::t('app', 'Download') ?></a>
                        </div>
                        <?php echo $this->render('1D_azir_form', ['formModel' => $model->formModel]) ?>
                    </div>
                    <br>
                    <div class="table-container indeks-main-table scroll scroll--simple">
                        <table>
                            <thead>
                            <tr>
                                <th><?= Yii::t('app', 'Tarix') ?></th>
                                <th><?= Yii::t('app', 'Faiz') ?></th>
                                <th><?= Yii::t('app', 'Əqdlərin həcmi') ?></th>
                                <th><?= Yii::t('app', 'Əqdlərin sayı') ?></th>
                            </tr>
                            </thead>
                            <tbody>
                            <?php $starIsset = false;?>
                            <?php foreach ($azirTable as $row): ?>
                                <tr>
                                    <td><?php echo DateHelper::showDate($row['date']) ?></td>
                                    <td><?php echo $row['faiz_az'] ?>% <? if (strpos($row['title_az'], '*') !== false) { echo " * "; $starIsset = true; }?></td>
                                    <td><?php echo $row['eqd_hecm_az'] ?></td>
                                    <td><?php echo $row['eqd_say_az'] ?></td>
                                </tr>
                            <?php endforeach; ?>
                            </tbody>
                        </table>

                    </div>
                    <br>
                    <?= $starIsset ? Yii::t('app', 'AZIR Star') : ""?>
                    <br><br>
                    <div class="table-container indeks-short-table">
                        <table>
                            <tr>
                                <th colspan="2"><?= Yii::t('app', 'Information about the 1D AZIR index') ?></th>
                            </tr>
                            <tr>
                                <td><?= Yii::t('app', 'Renewal date') ?></td>
                                <td><?php echo DateHelper::showDate($azirStats['lastDate']) ?></td>
                            </tr>
                            <tr>
                                <td><?= Yii::t('app', 'Interest rate, %') ?></td>
                                <td><?php echo $azirStats['lastFaizAz'] ?>%</td>
                            </tr>
                            <tr>
                                <td><?= Yii::t('app', 'Interest rate change since previous month-end') ?></td>
                                <td><?php echo $azirStats['faizAzDifferenceLastMonth'] ?>%</td>
                            </tr>
                            <tr>
                                <td><?= Yii::t('app', 'Interest rate change from year end') ?></td>
                                <td><?php echo $azirStats['faizAzDifferenceLastYear'] ?>%</td>
                            </tr>
                            <tr>
                                <td><?= Yii::t('app', 'Minimum interest rate on the last transaction day') ?></td>
                                <td><?php echo $azirStats['lastMinFaizAz'] ?>%</td>
                            </tr>
                            <tr>
                                <td><?= Yii::t('app', 'Maximum interest rate on the last transaction day') ?></td>
                                <td><?php echo $azirStats['lastMaxFaizAz'] ?>%</td>
                            </tr>
                            <tr>
                                <td><?= Yii::t('app', 'Value of transactions, mln') ?></td>
                                <td><?php echo $azirStats['lastEqdHecmAz'] ?></td>
                            </tr>
                            <tr>
                                <td><?= Yii::t('app', 'Change since previous month-end') ?></td>
                                <td><?php echo $azirStats['eqdHecmAzDifferenceLastMonth'] ?></td>
                            </tr>
                            <tr>
                                <td><?= Yii::t('app', 'Minimum volume for the past 1 year') ?></td>
                                <td><?php echo $azirStats['eqdHecmAzMinMaxLastYear']['min'] ?></td>
                            </tr>
                            <tr>
                                <td><?= Yii::t('app', 'Maximum value for the past 1 year') ?></td>
                                <td><?php echo $azirStats['eqdHecmAzMinMaxLastYear']['max'] ?></td>
                            </tr>
                            <tr>
                                <td><?= Yii::t('app', 'Value of transactions in dollars, mln USD') ?></td>
                                <td><?php echo $azirStats['usdEqual'] ?></td>
                            </tr>
                        </table>
                    </div>
                    <br>
                    <?/*
                    <?php if (Yii::$app->language == 'az'): ?>
                    <a target="_blank" href="/methodological_explanation.pdf" style="margin-top:24px; color:blue; text-decoration: none;font-style: normal;font-weight: normal"><?= Yii::t('app', 'Methodological explanation') ?></a>
                    <?php else: ?>
                        <a target="_blank" href="/methodological_explanation_en.pdf" style="margin-top:24px; color:blue; text-decoration: none;font-style: normal;font-weight: normal"><?= Yii::t('app', 'Methodological explanation') ?></a>
                    <?php endif; ?>
                    */?>
                </div>
            </div>
        </div>
    </div>
</div>