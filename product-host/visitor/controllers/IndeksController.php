<?

/*
 * Developed by SAFAROFF
 * Edited by Urmuz Tagizade :)
*/

namespace visitor\controllers;

use common\models\SettingsSaf;
use common\helpers\DateHelper;
use visitor\helpers\IndeksExportHelper;
use visitor\viewmodels\IndeksRatesViewModel;
use Yii;
use yii\base\Module;
use yii\web\BadRequestHttpException;
use yii\web\Response;

class IndeksController extends MainController
{

    public $indeksRatesViewModel;
    public $indeksExportHelper;

    public function __construct($id, Module $module, array $config = [], IndeksRatesViewModel $indeksRatesViewModel, IndeksExportHelper $indeksExportHelper)
    {
        $this->indeksRatesViewModel = $indeksRatesViewModel;
        $this->indeksExportHelper = $indeksExportHelper;
        parent::__construct($id, $module, $config);
    }

    public function actionRates(string $dateFrom = null, string $dateTo = null, bool $export = false)
    {
        $model = $this->indeksRatesViewModel;
        $azirStats = $model->azirModel::collectData();

        if ($dateFrom != null || $dateTo != null) {
            $model->formModel->load(Yii::$app->request->get());
            if ($model->formModel->validate()) {
                $azirTable = $model->get1DAZIRByDate($dateFrom, $dateTo);
            } else {
                return $this->redirect(['home/index']);
            }
        } else {
            $azirTable = $model->get1DAZIRAll();
        }
        /* Export to Excel */
        if ($export) {
            $this->indeksExportHelper->exportRates($azirTable);
        }
        return $this->render('rates', [
            'model' => $model,
            'azirTable' => $azirTable,
            'azirStats' => $azirStats
        ]);
    }


    /**
     * @throws BadRequestHttpException
     */
    public function actionChartData()
    {
        if (Yii::$app->request->isAjax) {
            Yii::$app->response->format = Response::FORMAT_JSON;

            $model = $this->indeksRatesViewModel;

            $datasets = [];

            // 1D AZIR
            $data1 = $model->getAZIRAll('1D AZIR%', 1);
            $datasets[] = [
                'label' => 'AZIR',
                'data' => $this->formatChartData($data1, 'faiz_az'),
                'fill' => false,
                'borderColor' => 'rgb(157, 221, 222)',
                'lineTension' => 0.1,
                'pointRadius' => 0
            ];

            // 1M AZIR
//            $data2 = $model->getAZIRAll('1M AZIR%');
//            $datasets[] = [
//                'label' => '30D AZIR',
//                'data' => $this->formatChartData($data2, 'faiz_az'),
//                'fill' => false,
//                'borderColor' => 'rgb(255, 99, 132)',
//                'lineTension' => 0.1,
//                'pointRadius' => 0
//            ];





            return ['datasets' => $datasets];
        }
        throw new BadRequestHttpException();
    }

    private function formatChartData($data, $fieldName)
    {
        $result = [];
        foreach ($data as $item) {
            $formattedDate = date('d', strtotime($item->date)) . ' ' . DateHelper::translateMonth(date('M Y', strtotime($item->date)));
            $value = str_replace(',', '.', $item->$fieldName);
            $result[] = [
                'x' => $formattedDate,
                'y' => str_replace('%', '', $value)
            ];
        }
        return $result;
    }

    public function actionAll(string $date = null, bool $export = false)
    {
        //need do it, because Irada ask me clossed "All" page
        return $this->redirect(Yii::$app->homeUrl);

        $settings = SettingsSaf::find()->where(['key' => 'show_before_day'])->one();

        if (!(is_null($date))) {
            if (!preg_match('/^\d{1,2}\/\d{1,2}\/\d{4}$/', $date) || !DateHelper::checkDate($date)) {
                // Data uygun formatta değil.
                return $this->redirect(['/']);
            }
        }
        try {
            $model = $this->indeksRatesViewModel;
            if ($date != null) {
                $date = explode('/', $date);
                $date = $date[2] . '-' . $date[1] . '-' . $date[0];
                $new_date = $date;
            } else {
                $new_date = date('Y-m-d');
            }
            /* -------------- */
            return $this->render('all', ['model' => $model, 'new_date' => $new_date, 'formModel' => $model->formModel, 'settings' => $settings]);
        } catch (\Exception $e) {
            echo $e->getMessage();
            exit;
        }
    }

}