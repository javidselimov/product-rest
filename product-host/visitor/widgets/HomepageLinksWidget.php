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
use common\models\HomepageLinks;

class HomepageLinksWidget extends Widget
{

    protected $homepageLinksModel;

    public function init()
    {
        $this->homepageLinksModel = HomepageLinks::getAllLinks();
    }

    public function run()
    {
        foreach ($this->homepageLinksModel as $link) {
            echo Html::beginTag('a', [
                'href' => Url::to($link['url_' . Yii::$app->language]),
                'target' => '_blank',
                'class' => 'icon_item',
            ]);
            echo Html::beginTag('div', ['class' => 'icon_ico']);
            echo Html::img(Yii::$app->params['uploadsUrl'] . '/homepage/' . $link['icon']);
            echo Html::endTag('div');
            echo Html::tag('p', $link['title_' . Yii::$app->language]);
            echo Html::endTag('a');
        }
    }

}