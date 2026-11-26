<?

use visitor\widgets\menu\LeftMenuWidget;

//echo LeftMenuWidget::widget();
//Генерация иконок для раздела National currency notes
if (Yii::$app->params['parentMenuID'] == 27)
    echo $this->render('@visitor/modules/moneymarks/views/layouts/applications.php');
?>
