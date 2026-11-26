<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\assets;

use yii\web\AssetBundle;
use Yii;

class ApexChartsMonthlyAsset extends AssetBundle
{
    public $baseUrl = '@web';
    public $css = [
        'plugins/apexcharts/apexcharts.min.css',
        'plugins/apexcharts/style.css',
    ];
    public $js = [
        'plugins/apexcharts/apexcharts.min.js',
        'plugins/apexcharts/init-monthly.js',
    ];
    public $depends = [
        'visitor\assets\CoreAsset',
    ];

}