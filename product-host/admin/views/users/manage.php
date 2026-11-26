<?

/* @var $form yii\bootstrap\ActiveForm
 * @var $model admin\viewmodels\UsersViewModel
 */

use yii\helpers\Url;
use yii\widgets\ActiveForm;
use yii\widgets\Pjax;
use admin\helpers\HtmlHelper;
use admin\helpers\ButtonsHelper;

$this->title = Yii::t('app', 'Profile-Manage');
$this->params['breadcrumbs'][] = $this->title;
?>
<div class="row">
    <div class="col-lg-6 col-md-12 col-xs-12">
        <div class="panel panel-color panel-inverse">
            <div class="panel-heading">
                <h3 class="panel-title"><i class="mdi mdi-clipboard-account"></i> <? echo Yii::t('app', 'User') ?></h3>
            </div>
            <div class="panel-body">
                <? Pjax::begin(); ?>
                <? $form = ActiveForm::begin(['id' => 'user-manage-form', 'options' => ['enctype' => 'multipart/form-data', 'data-pjax' => '1']]); ?>
                <div class="form-group">
                    <? echo $form->field($model->formModel, 'username')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                </div>
                <div class="form-group">
                    <? echo $form->field($model->formModel, 'email')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                </div>
                <div class="form-group">
                    <? echo $form->field($model->formModel, 'role')->dropDownList(Yii::t('other', 'roles'), ['prompt' => Yii::t('model', 'Empty-Dropdown')]) ?>
                </div>
                <? if (empty($model->formModel->id)): ?>
                    <div class="form-group">
                        <? echo $form->field($model->formModel, 'password')->passwordInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                    </div>
                <? else: ?>
                    <div class="form-group">
                        <? echo $form->field($model->formModel, 'newPassword')->passwordInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                    </div>
                <? endif; ?>
                <div class="form-group m-b-25">
                    <?
                    echo HtmlHelper::showImagePreview($model->formModel->avatar, ['folder' => 'avatars']);
                    echo $form->field($model->formModel, 'avatar')->fileInput(['class' => 'filestyle', 'data-input' => 'false', 'data-buttontext' => Yii::t('model', 'Empty-FileInput')]);
                    ?>
                </div>
                <div class="form-group">
                    <? echo ButtonsHelper::submitButton($model->formModel->id, ['disabled' => true]) ?>
                    <? echo ButtonsHelper::returnButton(Url::to(['users/index'])) ?>
                    <div id="preview-users">
                        <? echo $model->formModel->responseMessage ?>
                    </div>
                </div>
                <? ActiveForm::end(); ?>
                <? Pjax::end(); ?>
                <? $this->registerJsFile('@web/js/user-form.js', ['depends' => [\yii\web\JqueryAsset::class]]); ?>
            </div>
        </div>
    </div>
</div>