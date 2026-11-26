<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\widgets\blocks;

use Yii;
use yii\helpers\Url;
use yii\helpers\Html;
use common\models\InfoLines;
use common\helpers\DateHelper;
use visitor\helpers\HtmlHelper;

class PercentsBlockWidget extends BlockWidget
{

    protected $date;
    protected $coridorMin;
    protected $coridorMax;
    protected $coridorPercent;

    public function init()
    {
        parent::init();
        $this->coridorMin = InfoLines::getLastValueByAlias('corridor_min');
        $this->coridorMax = InfoLines::getLastValueByAlias('corridor_max');
        $this->coridorPercent = InfoLines::getLastValueByAlias('corridor_percent');
        $this->date = DateHelper::showDate($this->coridorMin['date'], 'dd.MM.YYYY');
    }

    public function run()
    {
        echo Html::tag('span', Yii::t('app', 'From currency {date}', ['date' => $this->date]));
        echo Html::tag('p', Html::a(HtmlHelper::getValueFromArray($this->aliases, 'corridor_min_short') . ' - ' . $this->coridorMin['value'], Url::to(['info-blocks/index', 'alias' => 'corridor_min'])));
        echo Html::tag('p', Html::a(HtmlHelper::getValueFromArray($this->aliases, 'corridor_max_short') . ' - ' . $this->coridorMax['value'], Url::to(['info-blocks/index', 'alias' => 'corridor_max'])));
        echo Html::tag('p', Html::a(HtmlHelper::getValueFromArray($this->aliases, 'corridor_percent') . ' - ' . $this->coridorPercent['value'], Url::to(['info-blocks/index', 'alias' => 'corridor_percent'])));
    }

}