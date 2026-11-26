<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\assets;

use yii\web\AssetBundle;

class MainAsset extends AssetBundle
{

    public $baseUrl = '@web';
    public $css = [
        'css/custom.css',
    ];
    public $depends = [
        'admin\assets\CoreAsset',
        'admin\assets\PluginsAsset',
    ];

}