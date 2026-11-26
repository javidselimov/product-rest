<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\assets;

use yii\web\AssetBundle;

class PluginsAsset extends AssetBundle
{
    public $baseUrl = '@web';
    public $css = [
        'plugins/bootstrap-sweetalert/sweet-alert.css',
        'plugins/bootstrap-select/css/bootstrap-select.min.css',
        'plugins/bootstrap-touchspin/css/jquery.bootstrap-touchspin.min.css',
        'plugins/bootstrap-colorpicker/css/bootstrap-colorpicker.min.css',
        'plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
        'plugins/lity-fancybox/lity-fancybox.min.css',
    ];
    public $js = [
        'plugins/bootstrap-sweetalert/sweet-alert.min.js',
        'plugins/bootstrap-sweetalert/sweet-alert.init.js',
        'plugins/bootstrap-filestyle/js/bootstrap-filestyle.min.js',
        'plugins/bootstrap-select/js/bootstrap-select.min.js',
        'plugins/bootstrap-touchspin/js/jquery.bootstrap-touchspin.min.js',
        'plugins/bootstrap-colorpicker/js/bootstrap-colorpicker.min.js',
        'plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
        'plugins/copy-to-clipboard/index.js',
        'plugins/lity-fancybox/lity-fancybox.min.js',
        'js/plugins.init.js',
    ];

}