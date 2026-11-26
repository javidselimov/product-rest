<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\models;

use Yii;
use yii\base\Model;
use common\helpers\DateHelper;

class PressReleasesForm extends Model
{

    public $type;
    public $dateFrom;
    public $dateTo;

    public function formName()
    {
        return '';
    }

    public function init()
    {
        parent::init();
        $this->dateFrom = date('01/m/Y');
    }

    public function rules()
    {
        return [
            [['type'], 'integer', 'max' => 2],
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