<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\controllers;

use admin\viewmodels\PressRelizQuestionModule;
use admin\viewmodels\PressRelizQuestionValueModule;
use common\models\PressReleases;
use common\models\PressRelizQuestion;
use common\models\PressRelizQuestionValue;
use Yii;
use admin\helpers\HtmlHelper;
use admin\viewmodels\PressReleasesViewModel;

//TODO Рефакторинг
class PressReleasesController extends MainController
{

    public $pressReleasesViewModel;

    public function actionQuestion(){


        try{
            $model = new PressRelizQuestionModule();

            $model->tableData = $model->gridViewFilter();
            return $this->render('question', ['model' => $model]);


        }catch(\Exception $e){
            echo $e->getMessage();
            exit;
        }


    }
    public function actionQuestionManage(int $id = null){

        try {
            $model = new PressRelizQuestionModule();
//            exit;
            $model->formModel = $model->pressReleasesQuestionModel::loadModel($id, ['scenario' => 'add']);
            if (Yii::$app->request->post()) {

                $data = [
                    'press_reliz_id' => Yii::$app->request->post()['PressRelizQuestion']['press_reliz_id'],
                    'question' =>Yii::$app->request->post()['PressRelizQuestion']['question'] ,
                    'active' =>Yii::$app->request->post()['PressRelizQuestion']['active'] ,
                    'question_en' =>Yii::$app->request->post()['PressRelizQuestion']['question_en'] ,
                ];
                if($id==null){
                    $pressRelease = new PressRelizQuestion();
                    $pressRelease->press_reliz_id= $data['press_reliz_id'];
                    $pressRelease->question= $data['question'];
                    $pressRelease->question_en= $data['question_en'];
                    $pressRelease->active= 0;

                    $pressRelease->save();
                }else{
                    $pressRelease = PressRelizQuestion::findOne($id);
                    $pressRelease->press_reliz_id= $data['press_reliz_id'];
                    $pressRelease->question= $data['question'];
                    $pressRelease->question_en= $data['question_en'];
                    $pressRelease->active= $data['active'];

                    $pressRelease->save();
                }





            } elseif (!isset($model->formModel)) {
                return $this->redirect(['home/index']);
            }


            $model_press= PressReleases::find()->where(['type' => 1])->all();



            return $this->render('questionManage', ['model' => $model,'model_press'=>$model_press]);

        }catch(\Exception $e){
            echo $e->getMessage();
        }



    }
    public function actionQuestionDelete(int $id = null){


        $pressRelease = PressRelizQuestion::findOne($id);

        PressRelizQuestionValue::deleteAll(['press_reliz_id' => $id]);



        $pressRelease->delete();

        return $this->redirect(['press-releases/question']);



    }

    public function actionQuestionResponse($id= null){
        try{
            $model = new PressRelizQuestionValueModule();

            $model->tableData = $model->gridViewFilter(['press_reliz_id'=>$id]);


//            $press=PressRelizQuestionValue::find()->all();

//            $model->tableData = $press->gridViewFilter();
            return $this->render('response', ['model' => $model]);

            var_dump($press);
        }catch(\Exception $e){
            echo $e->getMessage();
            exit;
        }

        exit;
    }
    public function __construct(string $id, \yii\base\Module $module, array $config = [], PressReleasesViewModel $pressReleasesViewModel)
    {
        $this->pressReleasesViewModel = $pressReleasesViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex(int $type)
    {
        $model = $this->pressReleasesViewModel;
        $model->type = $type;
        $model->tableData = $model->gridViewFilter(['type' => $type]);
        if ($model->tableData and $type <= 2) {
            return $this->render('index', ['model' => $model]);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionManage(int $type, int $id = null)
    {
        $model = $this->pressReleasesViewModel;
        $model->formModel = $model->pressReleasesModel::loadModel($id, ['scenario' => 'add']);
        $model->formModel->type = $type;
        if (Yii::$app->request->post()) {
            $model->formModel->load(Yii::$app->request->post());
            /* Валидация формы */
            if ($model->formModel->validate()) {
                $model->formModel->save();
                $model->formModel->responseMessage = HtmlHelper::showAlert(Yii::t('app', 'Form-Success'), 'success');
            } else {
                $errors = current($model->formModel->errors);
                $model->formModel->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
            }
        } elseif (!isset($model->formModel)) {
            return $this->redirect(['home/index']);
        }
        return $this->render('manage', ['model' => $model]);
    }

    public function actionChangeStatus(int $id)
    {
        $model = $this->pressReleasesViewModel->pressReleasesModel::loadModel($id);
        if ($model->changeRowStatus()) {
            return $this->redirect(['press-releases/index', 'type' => $model->type]);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionDelete(int $id)
    {
        $model = $this->pressReleasesViewModel->pressReleasesModel::loadModel($id);
        if ($model->delete()) {
            return $this->redirect(['press-releases/index', 'type' => $model->type]);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionAssets(int $pageID, int $id = null)
    {
        $this->layout = '@admin/views/layouts/popup';
        $model = $this->pressReleasesViewModel;
        $model->assetsFormModel = $model->pressReleasesAssetsModel::loadModel($id, ['scenario' => 'add']);
        $model->assetsTableData = $model->assetsGridViewFilter(['press_release_id' => $pageID]);
        $model->assetsPageID = $pageID;
        if (Yii::$app->request->post()) {
            $model->assetsFormModel->load(Yii::$app->request->post());
            $model->assetsFormModel->press_release_id = $pageID;
            /* Валидация формы */
            if ($model->assetsFormModel->validate()) {
                $model->assetsFormModel->save();
                $model->assetsFormModel->responseMessage = HtmlHelper::showAlert(Yii::t('app', 'Form-Success'), 'success');
            } else {
                $errors = current($model->assetsFormModel->errors);
                $model->assetsFormModel->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
            }
        }
        return $this->render('assets', ['model' => $model]);
    }

    public function actionDeleteAsset(int $pageID, int $id = null)
    {
        $model = $this->pressReleasesViewModel;
        $asset = $model->pressReleasesAssetsModel::find()->where(['press_release_id' => $pageID, 'id' => $id])->one();
        if (isset($asset) and $asset->delete()) {
            $this->redirect(['press-releases/assets', 'pageID' => $pageID]);
        } else {
            return $this->redirect(['home/index']);
        }
    }


}
