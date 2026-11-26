<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\widgets;

use Yii;
use yii\base\Widget;
use yii\helpers\Html;
use yii\helpers\Url;
use common\models\InfoLines;

class InfoLinesMenuWidget extends Widget
{

    public $availableAliases;

    public function init()
    {
        $this->availableAliases = InfoLines::find()->select('alias')->orderBy(['alias' => SORT_ASC])->distinct()->all();
    }

    public function run()
    {
        $titleList = Yii::t('other', 'infolines');
        echo Html::beginTag('ul', ['class' => 'list-unstyled']);
        foreach ($this->availableAliases as $item) {
            echo Html::beginTag('li');
            echo Html::a($titleList[$item['alias']], Url::to(['/info-blocks/index', 'alias' => $item['alias']]));
            echo Html::endTag('li');
        }
        echo Html::endTag('ul');
    }


}