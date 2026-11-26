<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\controllers;

use common\components\identity\UserIdentity;
use Yii;
use common\components\filesystem\SFTP;

class HomeController extends MainController
{

    public function beforeAction($action)
    {
        if (Yii::$app->user->identity->role == UserIdentity::MEAS_MANAGER_ROLE) {
            return $this->redirect(['/meas/default/index']);
        }
        return parent::beforeAction($action);
    }


    public function actionIndex()
    {
        return $this->render('index');
    }

    public function actionCleanCache()
    {
        SFTP::deleteFolders([Yii::getAlias('@visitor') . '/runtime/cache']);
        return $this->redirect(['home/index']);
    }

    public function actionIndexSearch()
    {
//        ini_set('max_execution_time', 0);
//        set_time_limit(0);
//        ini_set('memory_limit', '512M');

        Yii::$app->siteSearch->index();
        Yii::$app->newsSearch->index();
        return $this->redirect(['home/index']);
    }

}