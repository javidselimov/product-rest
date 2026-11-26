<?

/* @var $this \yii\web\View
 * @var $formModel visitor\models\MeasForm
 * @var $model common\models\Meas
 */

use common\helpers\DateHelper;
use yii\helpers\Url;

?>
<div class="article_item pjax-content">
    <span><? echo DateHelper::showDate($model['date'], 'long') ?></span>
    <p><? echo $model['title_' . Yii::$app->language] ?></p>
    <a href="<? echo Url::to(['press-releases/detail', 'id' => $model['id'], 'slug' => $model['slug']]) ?>" class="article_btn"><? echo Yii::t('app', 'More') ?></a>
</div>


