<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\assets;

use yii\web\AssetBundle;

class GoogleMapsAsset extends AssetBundle
{
    public $baseUrl = '@web';
    public $js = [
        'https://maps.googleapis.com/maps/api/js?key=AIzaSyCnoLa5LWr2u2zUFf8hpzGZNIKz8Gbqf-g',
        'plugins/google-maps/google-maps.js',
    ];
    public $depends = [
        'visitor\assets\CoreAsset',
    ];
}