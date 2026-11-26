<?

/* @var $form yii\bootstrap\ActiveForm
 * @var $model common\models\RunningLine
 */

use yii\helpers\Url;
use yii\widgets\ActiveForm;
use yii\widgets\Pjax;
use admin\helpers\HtmlHelper;
use admin\helpers\ButtonsHelper;

$this->title = Yii::t('app', 'Running Line');
$this->params['breadcrumbs'][] = $this->title;
?>
<div class="row">
    <div class="col-lg-6 col-md-12 col-xs-12">
        <div class="panel panel-color panel-inverse">
            <div class="panel-heading">
                <h3 class="panel-title"><? echo $this->title ?></h3>
            </div>
            <div class="panel-body">
                <? Pjax::begin(); ?>
                <? $form = ActiveForm::begin(['options' => ['data-pjax' => '1']]); ?>
                <div class="row">
                    <div class="col-lg-12">
                        <div class="row">
                            <div class="form-group">
                                <? echo $form->field($model, 'line_text_az')->textarea(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control', 'rows' => 3]) ?>
                            </div>
                            <div class="form-group">
                                <? echo $form->field($model, 'line_text_en')->textarea(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control', 'rows' => 3]) ?>
                            </div>
                            <div class="form-group">
                                <? echo $form->field($model, 'link_az')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                            </div>
                            <div class="form-group">
                                <? echo $form->field($model, 'link_en')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                            </div>
                            <div class="form-group checkbox checkbox-success m-b-20">
                                <? echo $form->field($model, 'activity', ['template' => "{input}\n{label}"])->checkbox(false, false) ?>
                            </div>
                            <div class="form-group">
                                <? echo ButtonsHelper::submitButton($model->id) ?>
                                <? echo ButtonsHelper::returnButton(Url::to(['home/index'])) ?>
                                <div id="preview-running-line-edit"><? echo $model->responseMessage ?></div>
                            </div>
                        </div>
                    </div>
                </div>
                <? ActiveForm::end(); ?>
                <? Pjax::end(); ?>
            </div>
        </div>
    </div>
</div>
