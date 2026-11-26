<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\models;

use yii\base\Model;
use yii\helpers\HtmlPurifier;

class LawsForm extends Model
{

    public $keyword;
    public $searchType;
    public $type;

    public function rules()
    {
        return [
            [['keyword'], 'string'],
            ['keyword', 'filter', 'filter' => function ($value) {
                return HtmlPurifier::process($value);
            }],
            [['keyword'], 'string', 'max' => 100],
            [['type', 'searchType'], 'integer'],
        ];
    }


}