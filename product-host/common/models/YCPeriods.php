<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

class YCPeriods extends MainModel
{



    public static function tableName()
    {
        return 'yield_curve_periods';
    }

    public function behaviors()
    {
        return [

        ];
    }

    public function rules()
    {
        return [
            /* Правила валидации для View */

        ];
    }


}
