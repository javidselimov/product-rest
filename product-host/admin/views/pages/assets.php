<?

/* @var $this \yii\web\View
 * @var $form yii\bootstrap\ActiveForm
 * @var $model admin\viewmodels\PagesViewModel
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
                        <h3 class="panel-title">Yeni Resurs</h3>
                    </div>
                    <div class="panel-body">
                        <? $form = ActiveForm::begin(['options' => ['enctype' => 'multipart/form-data', 'data-pjax' => '1']]); ?>
                        <div class="form-group">
                            <? echo $form->field($model->assetsFormModel, 'title_az')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                        </div>
                        <div class="form-group">
                            <? echo $form->field($model->assetsFormModel, 'title_en')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                        </div>
                        <div class="form-group touchspin-panel">
                            <? echo $form->field($model->assetsFormModel, 'position')->textInput(['placeholder' => '1', 'class' => 'form-control touchspin']) ?>
                        </div>
                        <div class="form-group">
                            <? echo $form->field($model->assetsFormModel, 'filename_az')->fileInput(['class' => 'filestyle', 'data-input' => 'false', 'data-buttontext' => Yii::t('model', 'Empty-FileInput')]); ?>
                        </div>
                        <div class="form-group">
                            <? echo $form->field($model->assetsFormModel, 'filename_en')->fileInput(['class' => 'filestyle', 'data-input' => 'false', 'data-buttontext' => Yii::t('model', 'Empty-FileInput')]); ?>
                        </div>
                        <div class="form-group checkbox checkbox-success">
                            <? echo $form->field($model->assetsFormModel, 'cover', ['template' => "{input}\n{label}"])->checkbox(false, false) ?>
                        </div>
                        <div class="form-group checkbox checkbox-success m-b-25">
                            <? echo $form->field($model->assetsFormModel, 'visible', ['template' => "{input}\n{label}"])->checkbox(false, false) ?>
                        </div>
                        <div class="form-group">
                            <? echo ButtonsHelper::submitButton($model->assetsFormModel->id) ?>
                            <a class="btn btn-primary btn-lg waves-effect waves-light" href="<? echo Url::to(['pages/assets', 'pageID' => $model->pageID]) ?>" data-pjax="0"><? echo Yii::t('app', 'Refresh-Button') ?></a>
                            <div id="preview">
                                <? echo $model->assetsFormModel->responseMessage ?>
                            </div>
                        </div>
                        <? ActiveForm::end(); ?>
                    </div>
                </div>
            </div>
            <div class="col-lg-9 col-md-9 col-xs-9">
                <? echo $this->render('_assets_grid', ['model' => $model]) ?>
            </div>
        </div>
    </div>
    <? Pjax::end(); ?>
</div>