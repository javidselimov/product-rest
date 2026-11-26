<?

/* @var $this \yii\web\View
 * @var $model visitor\models\SearchForm
 */

$this->title = Yii::t('app', 'Search-Results');
$errors = current($model->errors);
?>
<div class="content_wrap press-releases">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('//layouts/menu/left') ?></aside>
            <div class="content_content clear inner white_content">
                <div class="content_title"><? echo $this->title ?></div>
                <div class="articles">
                    <div class="article_item">
                        <? echo $errors[0] ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>