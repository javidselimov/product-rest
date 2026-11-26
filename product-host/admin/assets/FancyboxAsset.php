<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\assets;

use yii\web\AssetBundle;

class FancyboxAsset extends AssetBundle
{
    public $baseUrl = '@web';
    public $css = [
        'plugins/fancybox/dist/jquery.fancybox.min.css',
    ];
    public $js = [
        'plugins/fancybox/dist/jquery.fancybox.min.js',
        'plugins/fancybox/dist/init.js',
    ];
    public $depends = [
        'admin\assets\CoreAsset',
    ];
}