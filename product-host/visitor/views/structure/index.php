<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <aside>
                <?
                echo \visitor\widgets\menu\PagesMenuWidget::widget([
                    'pageID' => 3,
                    'leftPosition' => 3,
                    'rootID' => 1 // TOP_MENU_ID
                ]);
                ?>
                <? echo $this->render('//layouts/menu/left'); ?>
            </aside>
            <div class="content_content clear inner">
                <div class="content_title">
                    <? echo $this->title ?>
                </div>
                <div class="type_text-alx">
                    <?= $this->render('_orgchart') ?>
                </div>
            </div>
        </div>
    </div>
</div>
