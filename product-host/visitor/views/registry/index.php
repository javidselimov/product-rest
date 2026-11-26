<?

/* @var $this \yii\web\View
 * @var $model visitor\viewmodels\VideosViewModel
 */

$this->title = Yii::t('app', 'Registry');
?>
<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('//layouts/menu/left') ?></aside>
            <div class="content_content clear inner">
                <div class="content_title"><? echo $this->title ?></div>


                <div class="type_text pages-gallery">

                    <div class="lightgallery">


                        <a class="button pdf-view" data-iframe="true" id="open-pdf" data-src="/strategy_communication_v2.pdf#toolbar=0&navpanes=0&scrollbar=0">
                            Open PDF file
                        </a>

                    </div>


                    <ul>
                        <?php foreach ($actions as $key => $value): ?>
                            <li style="text-align:justify;"><a href="/registry/detail?category=<?php echo $key ?>"><?php echo $value['title'] ?></a></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>


