<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\models;

use yii\base\Model;

class MeasForm extends Model
{

    public $emitent;
    public $infoType;
    public $docType;
    public $dateFrom;
    public $dateTo;
    public $dqn;

    public function rules()
    {
        return [
            [['emitent', 'infoType', 'docType'], 'integer'],
            [['dqn'], 'string'],
            [['dateFrom', 'dateTo'], 'date', 'format' => 'php:d/m/Y'],
        ];
    }


}