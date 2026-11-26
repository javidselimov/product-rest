<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\controllers;

use Yii;
use yii\web\Controller;
use yii\filters\AccessControl;
use common\components\identity\UserIdentity;

class MainController extends Controller
{
    public function beforeAction($action)
    {
        // Принудительно включаем CSRF валидацию для безопасности
        $this->enableCsrfValidation = true;

        if (!parent::beforeAction($action)) {
            return false;
        }

        if (!Yii::$app->user->isGuest) {
            if (!\common\models\UserSession::validateCurrent()) {
                Yii::$app->user->logout();
                return $this->redirect(['login/index'])->send();
            }
        }

        return true;
    }

    public function init()
    {
        $this->layout = "@admin/views/layouts/main";
        parent::init();
    }

    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::className(),
                'rules' => [
                    [
                        'allow' => true,
                        'roles' => ['@'],
                        'matchCallback' => function ($rule, $action) {
                            return Yii::$app->user->identity->role == UserIdentity::ADMIN_ROLE or Yii::$app->user->identity->role == UserIdentity::MODERATOR_ROLE;
                        },
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
