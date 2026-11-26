<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\assets;

use yii\web\AssetBundle;

class TextEditorAsset extends AssetBundle
{

    public $baseUrl = '@web';
    public $js = [
        'plugins/tinymce/tinymce.min.js',
        'plugins/tinymce/init.js',
    ];
    public $depends = [
        'admin\assets\CoreAsset',
    ];
}