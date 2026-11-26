<?

/* @var $this \yii\web\View
 */

use visitor\assets\ApexChartsAsset;

ApexChartsAsset::register($this);

$this->title = Yii::t('app', 'Stats');

/* Facebook meta tags */
$this->registerMetaTag(['property' => 'og:url', 'content' => Yii::$app->request->absoluteUrl]);
$this->registerMetaTag(['property' => 'og:type', 'content' => 'article']);
$this->registerMetaTag(['property' => 'og:title', 'content' => $this->title]);
$this->registerMetaTag(['property' => 'og:description', 'content' => 'Azərbaycan Respublikasının Mərkəzi Bankı - Rəqəmsal ödənişlər üzrə infoqrafika']);
$this->registerMetaTag(['property' => 'og:image', 'content' => 'https://www.cbar.az/images/social-logo.png']);
?>
<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('//layouts/menu/left') ?></aside>
            <div class="content_content clear inner">
                <div class="content_title"><? echo $this->title ?></div>
                <div class="type_text pages-gallery">
                    <div class="two-column">
                        <div class="chart">
                            <h4><? echo Yii::t('other', 'chart18') ?></h4>
                            <div id="chart1"></div>
                        </div>
                        <div class="chart">
                            <h4><? echo Yii::t('other', 'chart19') ?></h4>
                            <div id="chart2"></div>
                        </div>
                    </div>
                    <div class="two-column">
                        <div class="chart">
                            <h4><? echo Yii::t('other', 'chart5') ?></h4>
                            <div id="chart3" class="bottom-value-light second-legend-none transform-down"></div>
                        </div>
                        <div class="chart chart-flip">
                            <div class="flip-card-inner">
                                <div class="flip-card-front">
                                    <h4><? echo Yii::t('other', 'chart16') ?></h4>
                                    <div id="chart4"></div>
                                </div>
                                <div class="flip-card-back">
                                    <h4><? echo Yii::t('other', 'chart17') ?></h4>
                                    <div id="chart4-1"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="two-column">
                        <div class="chart multiple-chart">
                            <h4><? echo Yii::t('other', 'chart1') ?></h4>
                            <div id="chart5"></div>
                        </div>
                        <div class="chart multiple-chart">
                            <h4><? echo Yii::t('other', 'chart2') ?></h4>
                            <div id="chart6"></div>
                        </div>
                    </div>

                    <div class="two-column">
                        <div class="chart">
                            <h4><? echo Yii::t('other', 'chart3') ?></h4>
                            <div id="chart7"></div>
                        </div>
                        <div class="chart">
                            <h4><? echo Yii::t('other', 'chart4') ?></h4>
                            <div id="chart8"></div>
                        </div>
                    </div>

                    <div class="two-column">
                        <div class="chart">
                            <h4><? echo Yii::t('other', 'chart8') ?></h4>
                            <div id="chart9" class="bottom-value-light second-legend-none transform-down visible-last-two-values"></div>
                        </div>
                        <div class="chart">
                            <h4><? echo Yii::t('other', 'chart9') ?></h4>
                            <div id="chart10" class="bottom-value-light second-legend-none transform-down visible-last-two-values"></div>
                        </div>
                    </div>

                    <div class="two-column">
                        <div class="chart">
                            <h4><? echo Yii::t('other', 'chart11') ?></h4>
                            <div id="chart11"></div>
                        </div>
                        <div class="chart">
                            <h4><? echo Yii::t('other', 'chart12') ?></h4>
                            <div id="chart12"></div>
                        </div>
                    </div>

                    <div class="two-column">
                        <div class="chart">
                            <h4><? echo Yii::t('other', 'chart6') ?></h4>
                            <div id="chart13" class="bottom-value-light second-legend-none transform-down visible-last-two-values"></div>
                        </div>
                        <div class="chart">
                            <h4><? echo Yii::t('other', 'chart7') ?></h4>
                            <div id="chart14" class="bottom-value-light second-legend-none transform-down visible-last-two-values"></div>
                        </div>
                    </div>
                    <div class="one-column pie-chart">
                        <div class="chart chart-flip">
                            <div class="flip-card-inner">
                                <div class="flip-card-front">
                                    <h4><? echo Yii::t('other', 'chart10') ?></h4>
                                    <div id="chart15" data-title="<? echo Yii::t('other', 'billion') ?>"></div>
                                </div>

                                <div class="flip-card-back">
                                    <h4><? echo Yii::t('other', 'chart10-1') ?></h4>
                                    <div id="chart15-1"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>