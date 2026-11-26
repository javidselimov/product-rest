<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\assets;

use yii\web\AssetBundle;
use Yii;

class ApexChartsAsset extends AssetBundle
{
    public $baseUrl = '@web';
    public $css = [
        'plugins/apexcharts/apexcharts.min.css',
        'plugins/apexcharts/style.css',
    ];
    public $js = [
        'plugins/apexcharts/apexcharts.min.js',
        'plugins/apexcharts/init.js',
    ];
    public $depends = [
        'visitor\assets\CoreAsset',
    ];

}