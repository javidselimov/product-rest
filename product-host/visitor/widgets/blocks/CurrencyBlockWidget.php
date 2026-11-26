<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\widgets\blocks;

use Yii;
use yii\helpers\Html;
use common\models\CurrencyRates;
use common\helpers\DateHelper;
use visitor\helpers\HtmlHelper;

class CurrencyBlockWidget extends BlockWidget
{

    protected $lastCurrency;
    protected $previousCurrency;

    public function init()
    {
        parent::init();
        $this->lastCurrency = CurrencyRates::getLastCurrency(['usd', 'eur', 'rub', 'try', 'date']);
        $this->previousCurrency = CurrencyRates::getPreviousCurrency(['usd', 'eur', 'rub', 'try', 'date']);
    }

    public function run()
    {
        echo Html::tag('span', Yii::t('app', 'From currency {date}', ['date' => $this->showLastCurrencyDate()]));
        echo Html::beginTag('ul');
    
        echo Html::tag('li',
            Html::tag('span', '1', ['class' => 'value']) .
            Html::tag('span', 'USD - ' . $this->showLastCurrencyValue('usd'), ['class' => 'currency']) .
            $this->showRateIcon('usd')
        );
    
        echo Html::tag('li',
            Html::tag('span', '1', ['class' => 'value']) .
            Html::tag('span', 'EUR - ' . $this->showLastCurrencyValue('eur'), ['class' => 'currency']) .
            $this->showRateIcon('eur')
        );
    
        echo Html::tag('li',
            Html::tag('span', '100', ['class' => 'value']) .
            Html::tag('span', 'RUB - ' . $this->showLastCurrencyValue('rub'), ['class' => 'currency']) .
            $this->showRateIcon('rub')
        );
    
        echo Html::tag('li',
            Html::tag('span', '1', ['class' => 'value']) .
            Html::tag('span', 'TRY - ' . $this->showLastCurrencyValue('try'), ['class' => 'currency']) .
            $this->showRateIcon('try')
        );
    
        echo Html::endTag('ul');
    }

    private function showLastCurrencyDate()
    {
        return DateHelper::showDate($this->lastCurrency->date, 'dd.MM.YYYY');
    }

    private function showLastCurrencyValue(string $currency)
    {
        return HtmlHelper::currencyFormat($this->lastCurrency->$currency);
    }

    private function showRateIcon(string $currency)
    {
        if ($this->lastCurrency->$currency > $this->previousCurrency->$currency) {
            return Html::img('/images/up.png');
        } elseif ($this->lastCurrency->$currency < $this->previousCurrency->$currency) {
            return Html::img('/images/down.png');
        } else {
            return Html::img('/images/table_cur.png');
        }
    }

}