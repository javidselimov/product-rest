<?

/* @var $form yii\widgets\ActiveForm
 * @var $model common\models\NewsSlider
 */

use yii\helpers\Url;
use yii\widgets\ActiveForm;
use yii\widgets\Pjax;
use admin\helpers\HtmlHelper;
use admin\helpers\ButtonsHelper;

$this->title = Yii::t('app', 'News-Slider');
$this->params['breadcrumbs'][] = $this->title;
?>
<div class="row">
    <div class="col-lg-6 col-md-12 col-xs-12">
        <div class="panel panel-color panel-inverse">
            <div class="panel-heading">
                <h3 class="panel-title"><? echo $this->title ?></h3>
            </div>
            <div class="panel-body">
                <? Pjax::begin(['id' => 'news-slider-pjax']); ?>
                <? $form = ActiveForm::begin(['options' => ['enctype' => 'multipart/form-data', 'data-pjax' => '1']]); ?>
                <div class="row">
                    <div class="col-lg-12">
                        <div class="row">
                            <? echo $form->field($model, 'title_az')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                            <? echo $form->field($model, 'title_en')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>

                            <? echo $form->field($model, 'description_az')->textarea(['rows' => 4, 'placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                            <? echo $form->field($model, 'description_en')->textarea(['rows' => 4, 'placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>

                            <? echo $form->field($model, 'news_date')->textInput(['placeholder' => 'YYYY-MM-DD', 'class' => 'form-control datepicker-autoclose']) ?>

                            <div class="form-group m-b-25">
                                <?
                                echo HtmlHelper::showImagePreview($model->image_path, ['folder' => 'news_slider']);
                                echo $form->field($model, 'image_path')->fileInput(['class' => 'filestyle', 'data-input' => 'false', 'data-buttontext' => Yii::t('model', 'Empty-FileInput')]);
                                ?>
                            </div>

                            <? echo $form->field($model, 'link_az')->textInput(['placeholder' => 'https://...', 'class' => 'form-control']) ?>
                            <? echo $form->field($model, 'link_en')->textInput(['placeholder' => 'https://...', 'class' => 'form-control']) ?>

                            <div class="touchspin-panel">
                                <? echo $form->field($model, 'ordering')->textInput(['placeholder' => '0', 'class' => 'form-control touchspin']) ?>
                            </div>

                            <div class="checkbox checkbox-success m-b-20">
                                <? echo $form->field($model, 'is_active', ['template' => "{input}\n{label}"])->checkbox([], false) ?>
                            </div>

                            <div class="form-group">
                                <? echo ButtonsHelper::submitButton($model->id) ?>
                                <? echo ButtonsHelper::returnButton(Url::to(['news-slider/index'])) ?>
                                <? if ($model->id and !$model->isNewRecord):
                                    echo ButtonsHelper::deleteButton($model->id);
                                endif;
                                ?>
                                <div id="preview-news-slider-edit"><? echo $model->responseMessage ?></div>
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
