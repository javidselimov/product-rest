<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use common\components\identity\UserIdentity;
use Yii;

class YCParams extends MainModel
{



    public static function tableName()
    {
        return 'yield_curve_parametrs';
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
