<?

/* @var $this \yii\web\View
 * @var $form yii\bootstrap\ActiveForm
 * @var $model admin\modules\gallery\viewmodels\GalleryViewModel
 */

use yii\helpers\Url;
use yii\widgets\ActiveForm;
use yii\widgets\Pjax;
use admin\helpers\ButtonsHelper;
?>
<div class="content">
    <? Pjax::begin(); ?>
    <div class="container">
        <div class="row">
            <div class="col-lg-3 col-md-3 col-xs-3">
                <div class="panel panel-color panel-inverse">
                    <div class="panel-heading">
                        <? if ($model->formModel->id): ?>
                            <h3 class="panel-title">Şəkil № <? echo $model->formModel->position ?></h3>
                        <? else: ?>
                            <h3 class="panel-title">Yeni Şəkil</h3>
                        <? endif; ?>
                    </div>
                    <div class="panel-body">
                        <? $form = ActiveForm::begin(['options' => ['enctype' => 'multipart/form-data', 'data-pjax' => '1']]); ?>
                        <div class="form-group">
                            <? echo $form->field($model->formModel, 'filename')->fileInput(['class' => 'filestyle', 'data-input' => 'false', 'data-buttontext' => Yii::t('model', 'Empty-FileInput')]); ?>
                        </div>
                        <div class="form-group touchspin-panel">
                            <? echo $form->field($model->formModel, 'position')->textInput(['placeholder' => '1', 'class' => 'form-control touchspin']) ?>
                        </div>
                        <div class="form-group checkbox checkbox-success m-b-25">
                            <? echo $form->field($model->formModel, 'active', ['template' => "{input}\n{label}"])->checkbox(false, false) ?>
                        </div>
                        <div class="form-group">
                            <? echo ButtonsHelper::submitButton($model->formModel->id) ?>
                            <a class="btn btn-primary btn-lg waves-effect waves-light" href="<? echo Url::to(['/gallery/photos', 'galleryID' => $model->galleryID]) ?>" data-pjax="0"><? echo Yii::t('app', 'Refresh-Button') ?></a>
                            <div id="preview">
                                <? echo $model->formModel->responseMessage ?>
                            </div>
                        </div>
                        <? ActiveForm::end(); ?>
                    </div>
                </div>
            </div>
            <div class="col-lg-9 col-md-9 col-xs-9">
                <? echo $this->render('index', ['model' => $model]) ?>
            </div>
        </div>
    </div>
    <? Pjax::end(); ?>
</div>