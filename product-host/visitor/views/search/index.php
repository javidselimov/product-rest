<?

/* @var $this \yii\web\View
 * @var $model visitor\models\SearchForm
 * @var $hits ZendSearch\Lucene\Search\QueryHit[]
 * @var $pagination yii\data\Pagination
 */

use yii\widgets\ActiveForm;
use yii\helpers\Html;
use yii\helpers\Url;
use yii\widgets\Pjax;
use visitor\helpers\HtmlHelper;
use justinvoelker\separatedpager\LinkPager;

$this->title = Yii::t('app', 'Search-Results');
?>
<div class="content_wrap press-releases">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('//layouts/menu/left') ?></aside>
            <div class=" clear inner white_content">
                <div class="content_title"><? echo $this->title ?> - <? echo $model->query ?></div>
                <div class="search-filters">
                    <style>
                        .search-filters .filters {
                            display: flex;
                            gap: 0;
                            margin-bottom: 20px;
                        }
                        .search-filters .filters-item {
                            flex: 0 0 auto;
                            margin-right: 10px;
                        }
                        .search-filters .filters-item:last-child {
                            margin-right: 0;
                        }
                        .search-filters .filters-item-input {
                            flex: 1 1 auto;
                            max-width: 250px;
                        }
                        .search-filters .filters-item-select {
                            flex: 0 0 200px;
                        }
                        .search-filters .search_input {
                            width: 100%;
                            height: 45px;
                            padding: 0 15px;
                            border: 1px solid #e1e1e1;
                            background-color: #fff;
                            font-size: 14px;
                            color: #333;
                            box-sizing: border-box;
                        }
                        .search-filters .search_select {
                            position: relative;
                        }
                        .search-filters .search_select:before {
                            display: none !important;
                        }
                        .search-filters .search_select:after {
                            content: "";
                            width: 0;
                            height: 0;
                            border-left: 5px solid transparent;
                            border-right: 5px solid transparent;
                            border-top: 5px solid #333;
                            position: absolute;
                            right: 15px;
                            top: 50%;
                            transform: translateY(-50%);
                            pointer-events: none;
                        }
                        .search-filters .search_select select {
                            width: 100%;
                            height: 45px;
                            padding: 0 30px 0 15px;
                            border: 1px solid #e1e1e1;
                            background-color: #fff;
                            appearance: none;
                            -webkit-appearance: none;
                            -moz-appearance: none;
                            font-size: 14px;
                            color: #333;
                            box-sizing: border-box;
                        }
                        .search-filters .search_submit {
                            width: 70px;
                            height: 45px;
                            background: url(/images/search_white.svg) no-repeat center #1c3651;
                            background-size: 20px 20px;
                            border: none;
                            cursor: pointer;
                            transition: background-color 0.2s;
                            text-indent: -9999px;
                        }
                        .search-filters .search_submit:hover {
                            background-color: #132438;
                        }
                        .article_footer {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-top: 10px;
                        }
                        .article_footer .article_btn {
                            margin-top: 0;
                        }
                        .article_item .date {
                            font-size: 14px;
                            color: #666;
                            margin: 0;
                        }
                        @media (max-width: 500px) {
                            .search-filters .filters {
                                flex-direction: column;
                                gap: 10px;
                            }
                            .search-filters .filters-item {
                                width: 100%;
                                margin-right: 0 !important;
                                max-width: none !important;
                                flex: none !important;
                            }
                            .search-filters .filters-item-input {
                                max-width: none !important;
                            }
                            .search-filters .filters-item-select {
                                flex: none !important;
                            }
                            .search-filters .search_submit {
                                width: 100%;
                            }
                        }
                    </style>
                    <? $form = ActiveForm::begin(['action' => Url::to(['/search/index']), 'method' => 'get', 'options' => ['class' => 'search-type-form']]); ?>
                        <div class="filters">
                            <div class="filters-item filters-item-input">
                                <? echo Html::activeTextInput($model, 'query', ['class' => 'search_input', 'placeholder' => Yii::t('app', 'Search-Query')]) ?>
                            </div>
                            <div class="filters-item filters-item-select">
                                <div class="search_select">
                                    <? echo Html::activeDropDownList($model, 'type', [
                                        'pages' => Yii::t('app', 'Pages'),
                                        'press-releases' => Yii::t('app', 'Press-Releases')
                                    ], ['class' => 'white_select', 'onchange' => 'this.form.submit()']) ?>
                                </div>
                            </div>
                            <div class="filters-item">
                                <? echo Html::submitButton('', ['class' => 'search_submit']) ?>
                            </div>
                        </div>
                    <? ActiveForm::end(); ?>
                </div>
                <div class="articles">
                    <? Pjax::begin(['enablePushState' => false]) ?>
                    <? $this->registerJs("$(\".article_item p\").highlight(\"{$model->query}\", {element: 'strong', className: 'highlight' });"); ?>
                    <? if (!empty($hits)): ?>
                        <!--Выводим результаты поиска-->
                        <? foreach ($hits as $hit): ?>
                            <div class="article_item">
                                <span><? echo $hit->{title_ . Yii::$app->language} ?></span>
                                <p><? echo HtmlHelper::purifySearchText($hit->{content_ . Yii::$app->language}) ?></p>
                                <div class="article_footer">
                                    <a href="<? echo Url::to([$model->url, 'id' => $hit->pageID, 'slug' => $hit->slug]) . '#' . $model->query ?>" target="_blank" data-pjax="0" class="article_btn">
                                        <? echo Yii::t('app', 'More') ?>
                                    </a>
                                    <? if ($model->type == 'press-releases' && !empty($hit->date)): ?>
                                        <p class="date"><? echo Yii::$app->formatter->asDate($hit->date, 'long') ?></p>
                                    <? endif; ?>
                                </div>
                            </div>
                        <? endforeach; ?>
                        <!--Конец-->
                    <? else: ?>
                        <? if (Yii::$app->language == 'en'): ?>
                            <h3> No matching results were found for the search term "<? echo $model->query ?>".</h3>
                        <? else: ?>
                            <h3>"<? echo $model->query ?>" sorğusu üzrə heç bir nəticə tapılmadı.</h3>
                        <? endif; ?>
                    <? endif; ?>
                    <? echo LinkPager::widget([
                        'pagination' => $pagination,
                        'firstPageLabel' => Yii::t('app', 'FirstPage'),
                        'lastPageLabel' => Yii::t('app', 'LastPage'),
                        'maxButtonCount' => $model::PAGINATION_BUTTON_COUND,
                    ]);
                    ?>
                    <? Pjax::end(); ?>
                </div>
            </div>
        </div>
    </div>
</div>