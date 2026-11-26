<?

/* @var $this \yii\web\View
 * @var $model visitor\modules\organization\viewmodels\OrganizationViewModel
 */

use yii\helpers\Url;
use yii\helpers\Html;

$this->title = Yii::t('app', 'Organizations-Staff-' . $model->staffType);
?>
<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <? echo $this->render('../layouts/menu') ?>
            <div class="content_content clear inner">
                <div class="content_title"><? echo $this->title ?></div>
                <div class="management_wrap">
                    <? foreach ($model->records as $staff): ?>
                        <!-- Выделяем первую запись -->
                        <? if ($staff['position'] == 1 and $staff['type'] == 1): ?>
                            <a href="<? echo Url::to(['staff/detail', 'id' => $staff['id']]) ?>" class="head_man">
                                <div class="head_col">
                                    <div class="man_img">
                                        <? echo Html::img(Yii::$app->params['uploadsUrl'] . '/organization/' . $staff['photo']) ?>
                                    </div>
                                </div>
                                <div class="head_col">
                                    <div class="man_txt">
                                        <p><? echo $staff['name_' . Yii::$app->language] ?></p>
                                        <span><? echo $staff['job_' . Yii::$app->language] ?></span>
                                    </div>
                                    <div class="man_btn"><? echo Yii::t('app', 'More') ?></div>
                                </div>
                            </a>
                        <? else: ?>
                            <a href="<? echo Url::to(['staff/detail', 'id' => $staff['id']]) ?>" class="man_item">
                                <div class="man_txt">
                                    <div class="man_img small">
                                        <? echo Html::img(Yii::$app->params['uploadsUrl'] . '/organization/' . $staff['photo']) ?>
                                    </div>
                                    <p><? echo $staff['name_' . Yii::$app->language] ?></p>
                                    <span><? echo $staff['job_' . Yii::$app->language] ?></span>
                                </div>
                                <div class="man_btn"><? echo Yii::t('app', 'More') ?></div>
                            </a>
                        <? endif; ?>
                        <!-- Конец -->
                    <? endforeach; ?>
                </div>
            </div>
        </div>
    </div>
</div>