<?
use visitor\widgets\menu\PagesMenuWidget;
?>
<aside>
    <? echo PagesMenuWidget::widget(['pageID' => 27, 'leftPosition' => 76, 'customID' => 27]); ?>
    <? echo $this->render('//layouts/menu/left') ?>
</aside>