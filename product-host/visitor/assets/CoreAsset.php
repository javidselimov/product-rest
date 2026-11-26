<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\assets;

use yii\web\AssetBundle;

class CoreAsset extends AssetBundle
{
    public $basePath = '@webroot';
    public $baseUrl = '@web';
    public $css = [
        'dist/core.min.css',
    ];
    public $js = [
        'dist/core.min.js',
    ];
}