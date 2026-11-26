<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\modules\meas\controllers;

use Yii;
use yii\filters\AccessControl;
use admin\controllers\MainController;

class BaseController extends MainController
{

    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::className(),
                'rules' => [
                    [
                        'allow' => true,
                        'roles' => ['@'],
                    ],
                    [
                        'allow' => false,
                        'roles' => ['?'],
                    ],
                ],
            ],
        ];
    }

}
