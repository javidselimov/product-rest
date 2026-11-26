<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\assets;

use yii\web\AssetBundle;

class CoreAsset extends AssetBundle
{
    public $baseUrl = '@web';
    public $css = [
        'css/bootstrap.min.css',
        'css/fonts.css',
        'css/core.css',
        'css/components.css',
        'css/icons.css',
        'css/pages.css',
        'css/menu.css',
        'css/responsive.css',
    ];
    public $js = [
        'js/jquery.min.js',
        'js/bootstrap.min.js',
        'js/detect.js',
        'js/fastclick.js',
        'js/jquery.blockUI.js',
        'js/waves.js',
        'js/jquery.slimscroll.js',
        'js/jquery.scrollTo.min.js',
        'js/jquery.core.js',
        'js/jquery.app.js',
    ];

}