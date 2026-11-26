<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\assets;

use yii\web\AssetBundle;
use Yii;

class ApexOldChartsAsset extends AssetBundle
{
    public $baseUrl = '@web';
    public $css = [
        'plugins/apexcharts/apexcharts.min.css',
        'plugins/apexcharts/style.css',
    ];
    public $js = [
        'plugins/apexcharts/apexcharts.min.js',
    ];
    public $depends = [
        'visitor\assets\CoreAsset',
    ];

    public function init()
    {
        $format = 'plugins/apexcharts/init-%s.js';
        $this->js[] = sprintf($format, Yii::$app->language);
    }
}