<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use common\components\identity\UserIdentity;
use Yii;

class YCYields extends MainModel
{



    public static function tableName()
    {
        return 'yield_curve_yields';
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



    /* Задаем безопасный хэш для пароля */




}
