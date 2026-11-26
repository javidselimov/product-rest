<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\controllers;

use admin\helpers\HtmlHelper;
use admin\viewmodels\YieldCurveParametrsViewModel;
use admin\viewmodels\YieldCurvePeriodsViewModel;
use admin\viewmodels\YieldCurveViewModel;
use common\models\YCParams;
use common\models\YCPeriods;
use common\models\YCYields;
use Yii;
use PhpOffice\PhpSpreadsheet\IOFactory;

class YieldCurveController extends MainController
{

    public $azirViewModel;
    public $yieldCurveParametrsViewModel;
    public $yieldCurvePeriodsViewModel;

    public function __construct(string $id, \yii\base\Module $module, array $config = [], YieldCurveViewModel $usersViewModel, YieldCurveParametrsViewModel $yieldCurveParametrsViewModel, YieldCurvePeriodsViewModel $yieldCurvePeriodsViewModel )
    {
        $this->azirViewModel = $usersViewModel;
        $this->yieldCurveParametrsViewModel = $yieldCurveParametrsViewModel;
        $this->yieldCurvePeriodsViewModel = $yieldCurvePeriodsViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex()
    {
        $model = $this->azirViewModel;
        $model->tableData = $model->gridViewFilter();
        return $this->render('yields_index', ['model' => $model]);
    }
    public function actionParametrs()
    {
        $model = $this->yieldCurveParametrsViewModel;
        $model->tableData = $model->gridViewFilter();
        return $this->render('yields_parametrs_index', ['model' => $model]);
    }
    public function actionPeriods()
    {
        $model = $this->yieldCurvePeriodsViewModel;
        $model->tableData = $model->gridViewFilter();
        return $this->render('yields_periods_index', ['model' => $model]);
    }


    public function parse_from_excel_array($file){
        $inputFileType = IOFactory::identify($file->tempName);
        $reader = IOFactory::createReader($inputFileType);
        $spreadsheet = $reader->load($file->tempName);
        $sheet = $spreadsheet->getActiveSheet();
        $data = $sheet->toArray();
        return $data;
    }


//$parametr_file=\yii\web\UploadedFile::getInstance($model->formModel,'parametr_file');
//
//$parse_parametr_array=$this->parse_from_excel_array($parametr_file);
//
//
//$period_file=\yii\web\UploadedFile::getInstance($model->formModel,'yield_file_name');
//
//$parse_periods=$this->parse_from_excel_array($period_file);


    public function actionCreate(int $id=null){


        $model = $this->azirViewModel;

        $model->formModel = $model->usersModel::loadModel($id);

        if (Yii::$app->request->post()) {


            //yield curve file download
            $file=\yii\web\UploadedFile::getInstance($model->formModel,'period');

            $parse_yield_array=$this->parse_from_excel_array($file);

            $date = Yii::$app->request->post()['YCYields']['date'];


            array_shift($parse_yield_array);



            if ($model->formModel->validate()) {


                YCYields::deleteAll(['date' => $date]);
                //                          Yii::$app->db->createCommand()->truncateTable('yield_curve_yields')->execute();

                for($i=0; $i< count($parse_yield_array); $i++){
                    $modelsave=new YCYields();
                    $modelsave->date=$date;
                    $modelsave->period=$parse_yield_array[$i][1];
                    $modelsave->profitability=$parse_yield_array[$i][2];
                    $modelsave->save();
                }


                $model->formModel->responseMessage = HtmlHelper::showAlert(Yii::t('app', 'Form-Success'), 'success');
            } else {
                $errors = current($model->formModel->errors);
                $model->formModel->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
            }


        }

        return $this->render('yields_manage', ['model' => $model]);


    }

    public function actionYieldsDelete(){
        $date=Yii::$app->request->get()['date'];
        YCYields::deleteAll(['date' => $date]);
        return $this->redirect(['yield-curve/index']);
    }


    public function actionParamsCreate(int $id=null){





        $model = $this->azirViewModel;

        $model->formModel = $model->usersModel::loadModel($id);

        if (Yii::$app->request->post()) {

            $file=\yii\web\UploadedFile::getInstance($model->formModel,'period');

            $parse_yield_array=$this->parse_from_excel_array($file);

            $date = Yii::$app->request->post()['YCYields']['date'];


            array_shift($parse_yield_array);



            if ($model->formModel->validate()) {


                YCParams::deleteAll(['date' => $date]);

                for($i=0; $i< count($parse_yield_array); $i++){
                    $modelsave=new YCParams();
                    $modelsave->date=$date;
                    $modelsave->beta_0=$parse_yield_array[$i][0];
                    $modelsave->beta_1=$parse_yield_array[$i][1];
                    $modelsave->beta_2=$parse_yield_array[$i][2];
                    $modelsave->lambda=$parse_yield_array[$i][3];
                    $modelsave->save();
                }


                $model->formModel->responseMessage = HtmlHelper::showAlert(Yii::t('app', 'Form-Success'), 'success');
            } else {
                $errors = current($model->formModel->errors);
                $model->formModel->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
            }


        }

        return $this->render('yields_params_manage', ['model' => $model]);



    }


    public function actionYieldsParamsDelete(){
        $date=Yii::$app->request->get()['date'];
        YCParams::deleteAll(['date' => $date]);
        return $this->redirect(['yield-curve/parametrs']);
    }


    public function actionPeriodsCreate(int $id=null){

        $model =$this->azirViewModel;

        $model->formModel = $model->usersModel::loadModel($id);

        if (Yii::$app->request->post()) {

            $file=\yii\web\UploadedFile::getInstance($model->formModel,'period');

            $parse_yield_array=$this->parse_from_excel_array($file);

            $date = Yii::$app->request->post()['YCYields']['date'];



            array_shift($parse_yield_array);




            if ($model->formModel->validate()) {



                YCPeriods::deleteAll(['date' => $date]);
                $modelsave=new YCPeriods();
                $modelsave->date=$date;
                $modelsave->three_month=$parse_yield_array[0][2];
                $modelsave->six_month=$parse_yield_array[1][2];
                $modelsave->nine_month=$parse_yield_array[2][2];
                $modelsave->one_year=$parse_yield_array[3][2];
                $modelsave->two_year=$parse_yield_array[4][2];
                $modelsave->three_year=$parse_yield_array[5][2];
                $modelsave->four_year=$parse_yield_array[6][2];
                $modelsave->save();



                $model->formModel->responseMessage = HtmlHelper::showAlert(Yii::t('app', 'Form-Success'), 'success');
            } else {
                $errors = current($model->formModel->errors);
                $model->formModel->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
            }


        }

        return $this->render('yields_periods_manage', ['model' => $model]);




    }


    public function actionYieldsPeriodsDelete(){
        $date=Yii::$app->request->get()['date'];
        YCPeriods::deleteAll(['date' => $date]);
        return $this->redirect(['yield-curve/periods']);
    }



}
