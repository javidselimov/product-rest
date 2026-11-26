<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\models;

use common\helpers\DateHelper;
use yii\base\Model;

class AzirForm1D extends Model
{

    public $dateFrom;
    public $dateTo;

    public function formName()
    {
        return '';
    }

    public function init()
    {
        parent::init();
        $this->dateFrom = date('d/m/Y', strtotime('-60 days'));
    }

    public function rules()
    {
        return [
            [['dateFrom', 'dateTo'], 'validateDate'],
        ];
    }

    public function validateDate($attribute, $params, $validator)
    {
        $date = $this->$attribute;
        if (!DateHelper::checkDate($date, 'd/m/Y')) {
            $this->addError($attribute, 'Bad Date Format');
        }
    }

}