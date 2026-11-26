<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

require(__DIR__ . '/vendor/yiisoft/yii2/BaseYii.php');

/* Кастомный класс Yii для автокомплита компонентов*/

class Yii extends \yii\BaseYii
{
    /**
     * @var WebApplication экземпляр приложения
     */
    public static $app;
}

/**
 * Прописываем в параметрах
 * @property \common\components\uploader\ImageResize $imageResizer
 * @property \common\components\mail\Obfuscator $mailObfuscator
 * @property \himiklab\yii2\search\Search $siteSearch
 * @property \himiklab\yii2\search\Search $newsSearch
 */
abstract class WebApplication extends yii\web\Application
{
}

spl_autoload_register(['Yii', 'autoload'], true, true);
Yii::$classMap = include(__DIR__ . '/vendor/yiisoft/yii2/classes.php');
Yii::$container = new yii\di\Container();
