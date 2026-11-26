<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\viewmodels;

use common\models\CurrencyRates;

class CurrencyRatesViewModel
{
    public $currencyRatesModel;

    public function __construct(CurrencyRates $currencyRatesModel)
    {
        $this->currencyRatesModel = $currencyRatesModel;
    }

    public function gridViewFilter()
    {
        $dataProvider = $this->currencyRatesModel->loadDataProvider();
        //Указываем сортировку
        $dataProvider->sort = ['defaultOrder' => ['date' => SORT_DESC]];
        //Данные для фильтрации
        $dataProvider->query->andFilterWhere(['like', 'usd', $this->currencyRatesModel->usd]);
        $dataProvider->query->andFilterWhere(['like', 'eur', $this->currencyRatesModel->eur]);
        $dataProvider->query->andFilterWhere(['like', 'gbp', $this->currencyRatesModel->gbp]);
        $dataProvider->query->andFilterWhere(['like', 'rub', $this->currencyRatesModel->rub]);
        $dataProvider->query->andFilterWhere(['like', 'try', $this->currencyRatesModel->try]);
        return $dataProvider;
    }


}

