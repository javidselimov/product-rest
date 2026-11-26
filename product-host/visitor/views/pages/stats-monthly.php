<?

/* @var $this View
 */

use yii\helpers\Url;
use yii\web\View;
use visitor\assets\ApexChartsMonthlyAsset;

ApexChartsMonthlyAsset::register($this);

$this->title = Yii::t('app', 'Stats');

/* Facebook meta tags */
$this->registerMetaTag(['property' => 'og:url', 'content' => Yii::$app->request->absoluteUrl]);
$this->registerMetaTag(['property' => 'og:type', 'content' => 'article']);
$this->registerMetaTag(['property' => 'og:title', 'content' => $this->title]);
$this->registerMetaTag(['property' => 'og:description', 'content' => $this->title]);
$this->registerMetaTag(['property' => 'og:image', 'content' => 'https://www.cbar.az/images/social-logo.png']);
?>
<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('//layouts/menu/left') ?></aside>
            <div class=" clear inner">
                <div class="content_title">
                    <? echo $this->title ?>


                    <div class="switch-container">
                        <div class="switch switch--horizontal">
                            <input id="radio-a" type="radio" value="<? echo Url::to(['pages/stats-monthly']) ?>" name="first-switch" checked="checked"/>
                            <label for="radio-a"><? echo Yii::t('other', 'chart-monthly') ?></label>
                            <input id="radio-b" type="radio" value="<? echo Url::to(['pages/stats-yearly']) ?>" name="first-switch"/>
                            <label for="radio-b"><? echo Yii::t('other', 'chart-yearly') ?></label>
                            <span class="toggle-outside"><span class="toggle-inside"></span></span>
                        </div>
                    </div>

                </div>
                <div class="type_text pages-gallery">

                    <div class="chart-list">
                        <div class="chart-list-item"><? echo Yii::t('other', 'chart-heading-1') ?></div>
                        <div class="chart-wrapper">
                            <div class="chart-inner">

                                <div class="two-column">
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart1') ?></h4>
                                        <div id="chart1"></div>
                                    </div>
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart2') ?></h4>
                                        <div id="chart2"></div>
                                    </div>
                                </div>
                                <!--                                <div class="one-column">-->
                                <!--                                    <div class="chart">-->
                                <!--                                        <h4>--><? // echo Yii::t('other', 'chart3') ?><!--</h4>-->
                                <!--                                        <div id="chart3" class="bottom-value-light second-legend-none transform-down"></div>-->
                                <!--                                    </div>-->
                                <!--                                </div>-->
                                <!--                                <div class="one-column">-->
                                <!--                                    <div class="chart">-->
                                <!--                                        <h4>--><? // echo Yii::t('other', 'chart4') ?><!--</h4>-->
                                <!--                                        <div id="chart4" class="bottom-value-light second-legend-none transform-down"></div>-->
                                <!--                                    </div>-->
                                <!--                                </div>-->
                                <div class="two-column">
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart90') ?></h4>
                                        <div id="chart90"></div>
                                    </div>
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart91') ?></h4>
                                        <div id="chart91"></div>
                                    </div>
                                </div>
                                <div class="two-column">
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart92') ?></h4>
                                        <div id="chart92"></div>
                                    </div>
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart93') ?></h4>
                                        <div id="chart93"></div>
                                    </div>
                                </div>
                                <div class="two-column">
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart5') ?></h4>
                                        <div id="chart5"></div>
                                    </div>
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart6') ?></h4>
                                        <div id="chart6"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="chart-list-item"><? echo Yii::t('other', 'chart-heading-2') ?></div>
                        <div class="chart-wrapper">
                            <div class="chart-inner">
                                <!--                                <div class="one-column">-->
                                <!--                                    <div class="chart flip-card-front">-->
                                <!--                                        <h4>Cari hesablardan aparılan müştəri köçürmələrinin strukturu (I yarımil 2022)</h4>-->
                                <!--                                        <div id="chart7" data-title="--><? // echo Yii::t('other', 'billion') ?><!--"></div>-->
                                <!--                                    </div>-->
                                <!--                                </div>-->
                                <div class="one-column">
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart7') ?></h4>
                                        <div id="chart8"></div>
                                    </div>
                                </div>
                                <div class="one-column">
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart8') ?></h4>
                                        <div id="chart9" class="bottom-value-light second-legend-none transform-down"></div>
                                    </div>
                                </div>

                                <div class="one-column">
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart9') ?></h4>
                                        <div id="chart10" class="bottom-value-light second-legend-none transform-down"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="chart-list-item"><? echo Yii::t('other', 'chart-heading-3') ?></div>
                        <div class="chart-wrapper">
                            <div class="chart-inner">

                                <div class="one-column">
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart10') ?></h4>
                                        <div id="chart11" class="bottom-value-light second-legend-none transform-down"></div>
                                    </div>
                                    <!--                                    <div class="chart">-->
                                    <!--                                        <h4>Ödəniş kartlarının bölgüsü (I yarımil 2022)</h4>-->
                                    <!--                                        <div id="chart12"></div>-->
                                    <!--                                    </div>-->
                                </div>
                                <div class="one-column">
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart11') ?></h4>
                                        <div id="chart13" class="bottom-value-light"></div>
                                    </div>
                                </div>
                                <div class="one-column">
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart12') ?></h4>
                                        <div id="chart14" class="bottom-value-light"></div>
                                    </div>
                                </div>

                                <div class="two-column">
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart13') ?></h4>
                                        <div id="chart15"></div>
                                    </div>
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart14') ?></h4>
                                        <div id="chart16"></div>
                                    </div>
                                </div>

                                <div class="one-column">
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart15') ?></h4>
                                        <div id="chart17" class="bottom-value-light second-legend-none transform-down"></div>
                                    </div>
                                </div>
                                <div class="one-column">
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart16') ?></h4>
                                        <div id="chart18" class="bottom-value-light second-legend-none transform-down"></div>
                                    </div>
                                </div>

                                <div class="two-column">
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart17') ?></h4>
                                        <div id="chart19"></div>
                                    </div>
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart18') ?></h4>
                                        <div id="chart20"></div>
                                    </div>
                                </div>

                                <div class="one-column">
                                    <div class="chart flip-card-front">
                                        <h4><? echo Yii::t('other', 'chart19') ?></h4>
                                        <div id="chart21"></div>
                                    </div>
                                </div>

                                <div class="two-column">
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart20') ?></h4>
                                        <div id="chart22"></div>
                                    </div>
                                    <div class="chart">
                                        <h4><? echo Yii::t('other', 'chart21') ?></h4>
                                        <div id="chart23"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
