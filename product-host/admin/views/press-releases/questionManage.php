<?

/* @var $this \yii\web\View
 * @var $form yii\bootstrap\ActiveForm
 * @var $model admin\viewmodels\PressReleasesViewModel
 */
use common\components\grid\GridView;
use yii\helpers\ArrayHelper;
use yii\helpers\Url;
use yii\widgets\ActiveForm;
use yii\widgets\Pjax;
use admin\assets\TextEditorAsset;
use admin\assets\FancyboxAsset;
use admin\helpers\ButtonsHelper;

TextEditorAsset::register($this);
FancyboxAsset::register($this);

$this->title = 'Press Reliz Statistika';
$this->params['breadcrumbs'][] = $this->title;
?>



<div class="row">
    <div class="col-lg-12 col-md-12 col-xs-12">
        <div class="panel panel-color panel-inverse">
            <div class="panel-heading">
                <div class="panel-title">
                    <? echo $this->title ?>
                    <? if (!$model->formModel->isNewRecord): ?>
                        <div class="pull-right">
                            <button type="button" data-src="<?= Url::to(['press-releases/assets', 'pageID' => $model->formModel->id]) ?>" data-width="1100" data-height="900" data-fancybox="data-fancybox" class="btn btn-teal fancybox" title="<?= Yii::t('app', 'Pages-Assets') ?>">
                                <i class="glyphicon glyphicon-picture"></i>
                            </button>
                        </div>
                    <? endif; ?>
                </div>
            </div>
            <div class="panel-body">
                <? Pjax::begin(); ?>
                <? $form = ActiveForm::begin(['options' => ['enctype' => 'multipart/form-data', 'data-pjax' => '1']]); ?>
                <div class="row">
                    <div class="col-lg-12">
                        <div class="grid-container">
                            <div class="row">
                                <div class="form-group">
                                <?= $form->field($model->formModel, 'press_reliz_id')->dropDownList(ArrayHelper::map($model_press, 'id', function($item) {
                                    return $item->title_az . ' - ' . $item->created_at;
                                })); ?>
                                </div>
                                <div class="form-group">
                                    <? echo $form->field($model->formModel, 'question')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                                </div>
                                <div class="form-group">
                                    <? echo $form->field($model->formModel, 'question_en')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                                </div>
                                <div class="form-group">
                                    <?php echo $form->field($model->formModel, 'active')->dropDownList(['1' => 'Aktiv', '0' => 'Passiv'], ['class' => 'form-control']) ?>
                                </div>



                                <!--                                <div class="form-group">-->
<!--                                    --><?// echo $form->field($model->formModel, 'date')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control datepicker-autoclose']) ?>
<!--                                </div>-->
<!--                                <div class="form-group">-->
<!--                                    --><?// echo $form->field($model->formModel, 'content_az')->textarea(['class' => 'form-control']) ?>
<!--                                </div>-->
<!--                                <div class="form-group">-->
<!--                                    --><?// echo $form->field($model->formModel, 'content_en')->textarea(['class' => 'form-control']) ?>
<!--                                </div>-->
                                <div class="form-group">
                                    <? echo ButtonsHelper::submitButton($model->formModel->id) ?>
                                    <? echo ButtonsHelper::returnButton(Url::to(['press-releases/index'])) ?>
                                    <? if ($model->formModel->id and !$model->formModel->isNewRecord)
//                                    ButtonsHelper::deleteButton($model->formModel->id);

                                    echo '<a class="btn btn-danger float-right btn-lg waves-effect waves-light" href="/press-releases/question-delete?id='.$model->formModel->id.'">Delete</a>';

                                    ?>
                                    <div id="preview-edit"><? echo $model->formModel->responseMessage ?></div>
                                </div>
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
