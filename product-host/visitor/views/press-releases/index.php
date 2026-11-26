<?

/* @var $this \yii\web\View
 * @var $model visitor\viewmodels\PressReleasesViewModel
 * @var $dataProvider common\models\PressReleases
 */

use yii\helpers\ArrayHelper;
use yii\helpers\Url;
use yii\widgets\ListView;
use yii\widgets\Pjax;

$this->title = ArrayHelper::getValue(Yii::t('model', 'Press-Releases-Types'), $model->type);
/* Facebook meta tags */
$this->registerMetaTag(['property' => 'og:url', 'content' => Yii::$app->request->absoluteUrl]);
$this->registerMetaTag(['property' => 'og:type', 'content' => 'article']);
$this->registerMetaTag(['property' => 'og:title', 'content' => $this->title]);
$this->registerMetaTag(['property' => 'og:image', 'content' => 'https://www.cbar.az/images/social-logo.png']);
?>
<div class="content_wrap press-releases">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('//layouts/menu/left') ?></aside>
            <div class=" clear inner white_content">
                <? Pjax::begin(['enablePushState' => true]); ?>
                <div class="content_title"><a data-pjax="0" href="<? echo Url::to(['press-releases/index', 'type' => $model->type]) ?>"><? echo $this->title ?></a></div>
                <? echo $this->render('_form', ['model' => $model]) ?>
                <br>
                <?
                echo ListView::widget([
                    'dataProvider' => $dataProvider,
                    'itemView' => '_table',
                    'layout' => "{items}\n<div class='pagination-table'>{pager}</div>",
                ]);
                ?>
                <? Pjax::end(); ?>
            </div>
        </div>
    </div>
</div>