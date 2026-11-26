<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\viewmodels;

use common\models\CurrencyRates;
use visitor\models\CurrencyForm;

class CurrencyRatesViewModel
{
    public $currencyRatesModel;
    public $formModel;
    public $lastCurrency;
    public $previousCurrency;

    public function __construct(CurrencyRates $currencyRatesModel, CurrencyForm $currencyFormModel)
    {
        $this->currencyRatesModel = $currencyRatesModel;
        $this->formModel = $currencyFormModel;
        $this->lastCurrency = CurrencyRates::getLastCurrency();
        $this->previousCurrency = CurrencyRates::getPreviousCurrency();
    }

}

