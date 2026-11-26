<?

use visitor\widgets\menu\PagesMenuWidget;
?>
<aside>
    <? echo PagesMenuWidget::widget(['pageID' => 3,'leftPosition' => 3]); ?>
    <? echo $this->render('//layouts/menu/left') ?>
</aside>