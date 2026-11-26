<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\models;

use yii\base\Model;

class CurrencyForm extends Model
{

    public $dateFrom;
    public $dateTo;
    public $currencyCode;

    public function rules()
    {
        return [
            [['dateFrom', 'dateTo', 'currencyCode'], 'string'],
        ];
    }

}