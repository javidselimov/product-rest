<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\modules\api\controllers;

use Yii;
use yii\filters\auth\HttpBearerAuth;
use yii\rest\Controller;
use yii\web\MethodNotAllowedHttpException;
use yii\web\UploadedFile;

use admin\modules\api\models\BankInfoModel;

class BankInfoController extends Controller
{

    protected function verbs()
    {
        return [
            'index' => ['POST'],
        ];
    }

    public function behaviors()
    {
        $behaviors = parent::behaviors();
        $behaviors['authenticator']['class'] = HttpBearerAuth::class;
        return $behaviors;
    }

    public function init()
    {
        parent::init();
        Yii::$app->user->enableSession = false;
    }

    public function beforeAction($action)
    {
        if (Yii::$app->getRequest()->getMethod() !== 'POST') {
            throw new MethodNotAllowedHttpException('Only allow POST request');
        }
        return parent::beforeAction($action);
    }

    public function actionIndex()
    {
        $response = [];
        $model = new BankInfoModel();
        $model->xmlFiles = UploadedFile::getInstancesByName('xmlFiles');
        if ($model->validate()) {
            foreach ($model->xmlFiles as $file) {
                $fileName = $file->baseName . '.' . $file->extension;
                $response[$fileName] = 'Success';
                $file->saveAs(Yii::getAlias('@visitor') . '/web/bankinfonew/' . $fileName);
            }
            return $response;
        }
        $response['errorMessage'] = current($model->errors);
        return $response;

    }

}