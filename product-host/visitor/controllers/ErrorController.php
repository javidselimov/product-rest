<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace visitor\controllers;

use Yii;
use yii\web\Controller;

class ErrorController extends Controller
{

    public function actionError()
    {
        $exception = Yii::$app->errorHandler->exception;
        if ($exception !== null and YII_ENV_DEV) {
            return $exception->getMessage();
        } else {
            Yii::$app->getResponse()->redirect(['home/index'])->send();
            return;
        }
    }

    public function actionAccess()
    {
        return $this->render('//layouts/error');
    }

}
