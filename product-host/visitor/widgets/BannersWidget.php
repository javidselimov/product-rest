<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\widgets;

use Yii;
use yii\base\Widget;
use yii\helpers\Html;
use yii\helpers\Url;
use common\models\Banners;

class BannersWidget extends Widget
{

    protected $bannersModel;

    public function init()
    {
        $this->bannersModel = Banners::getAllBanners();
    }

    public function run()
    {
        foreach ($this->bannersModel as $banner) {
            echo Html::beginTag('a', [
                'href' => Url::to($banner['url']),
                'target' => '_blank',
                'class' => 'swiper-slide',
                'style' => 'background: url(' . Yii::$app->params['uploadsUrl'] . '/banners/' . $banner['background'] . ') no-repeat top center; background-size: cover;',
            ]);
            if ($banner['clean'] == false) {
                echo Html::tag('div', $banner['title_' . Yii::$app->language], ['class' => 'slide_content']);
            } else {
                echo Html::tag('div', false, ['class' => 'slide_content']);
            }
            echo Html::endTag('a');
        }
    }

}