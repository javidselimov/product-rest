<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\widgets\blocks;

use Yii;
use yii\helpers\Html;
use yii\helpers\Url;
use common\models\InfoLines;
use common\helpers\DateHelper;
use visitor\helpers\HtmlHelper;

class MonetaryBlockWidget extends BlockWidget
{

    protected $date;
    protected $moneyReserve;
    protected $moneyBase;

    public function init()
    {
        parent::init();
        $this->moneyReserve = InfoLines::getLastValueByAlias('money_reserve_usd');
        $this->moneyBase = InfoLines::getLastValueByAlias('money_base');
        $this->date = DateHelper::showDate($this->moneyReserve['date'], 'dd.MM.YYYY');

    }

    public function run()
    {
        echo Html::beginTag('div', ['class' => 'table_table']);
        echo Html::tag('div', Yii::t('app', 'From {date}', ['date' => $this->date]), ['class' => 'valuta_title']);
        echo Html::beginTag('div', ['class' => 'table_items']);
        echo Html::beginTag('div', ['class' => 'table_row']);
        echo Html::a(HtmlHelper::getValueFromArray($this->aliases, 'money_reserve_usd'), Url::to(['info-blocks/index', 'alias' => 'money_reserve_usd']), ['class' => 'valyuta']);
        echo Html::tag('div', $this->moneyReserve['value'], ['class' => 'kurs']);
        echo Html::endTag('div');
        echo Html::beginTag('div', ['class' => 'table_row']);
        echo Html::a(HtmlHelper::getValueFromArray($this->aliases, 'money_base'), Url::to(['info-blocks/index', 'alias' => 'money_base']), ['class' => 'valyuta']);
        echo Html::tag('div', $this->moneyBase['value'], ['class' => 'kurs']);
        echo Html::endTag('div');
        echo Html::endTag('div');
        echo Html::endTag('div');
    }

}