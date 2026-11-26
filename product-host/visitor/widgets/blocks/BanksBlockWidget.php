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

class BanksBlockWidget extends BlockWidget
{

    protected $date;
    protected $bankCredit;
    protected $bankNation;

    public function init()
    {
        parent::init();
        $this->bankCredit = InfoLines::getLastValueByAlias('bank_credit');
        $this->bankNation = InfoLines::getLastValueByAlias('bank_nation');
        $this->date = DateHelper::showDate($this->bankCredit['date'], 'dd.MM.Y');
    }

    public function run()
    {
        echo Html::beginTag('div', ['class' => 'table_table']);
        echo Html::tag('div', Yii::t('app', 'From {date}', ['date' => $this->date]), ['class' => 'valuta_title']);
        echo Html::beginTag('div', ['class' => 'table_items']);
        echo Html::beginTag('div', ['class' => 'table_row']);
        echo Html::a(HtmlHelper::getValueFromArray($this->aliases, 'bank_credit'), Url::to(['info-blocks/index', 'alias' => 'bank_credit']), ['class' => 'valyuta']);
        echo Html::tag('div', $this->bankCredit['value'], ['class' => 'kurs']);
        echo Html::endTag('div');
        echo Html::beginTag('div', ['class' => 'table_row']);
        echo Html::a(HtmlHelper::getValueFromArray($this->aliases, 'bank_nation'), Url::to(['info-blocks/index', 'alias' => 'bank_nation']), ['class' => 'valyuta']);
        echo Html::tag('div', $this->bankNation['value'], ['class' => 'kurs']);
        echo Html::endTag('div');
        echo Html::endTag('div');
        echo Html::endTag('div');
    }

}