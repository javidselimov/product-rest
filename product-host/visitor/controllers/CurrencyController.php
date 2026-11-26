<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\controllers;

use Yii;
use common\helpers\DateHelper;
use visitor\viewmodels\CurrencyRatesViewModel;
use visitor\helpers\CurrencyExportHelper;

class CurrencyController extends MainController
{

    public $currencyRatesViewModel;
    public $currencyExportHelper;

    public function __construct($id, \yii\base\Module $module, array $config = [], CurrencyRatesViewModel $currencyRatesViewModel, CurrencyExportHelper $currencyExportHelper)
    {
        $this->currencyRatesViewModel = $currencyRatesViewModel;
        $this->currencyExportHelper = $currencyExportHelper;
        parent::__construct($id, $module, $config);
    }

    public function actionRates(string $date = null, bool $export = false)
    {

        $model = $this->currencyRatesViewModel;

        if ($date and DateHelper::checkDate($date)) {
            $model->previousCurrency = $model->lastCurrency;
            $model->lastCurrency = $model->currencyRatesModel::getCurrencyByDate($date);
        }
        /* Export в Excel */
          if ($export == true) $this->currencyExportHelper->exportRates($model);
       /*-------------- */
        return $this->render('rates', ['model' => $model, 'formModel' => $model->formModel]);
    }

    public function actionCustom(bool $export = false)
    {
        // Form modelini və currency modelini alırıq
        $formModel = $this->currencyRatesViewModel->formModel;
        $model = $this->currencyRatesViewModel->currencyRatesModel;

        // Əgər POST sorğusu yoxdursa, formu render edirik
        if (!Yii::$app->request->post() && !$export) {
            return $this->render('custom', ['formModel' => $formModel, 'model' => null]);
        }

        // POST sorğusu varsa
        if (Yii::$app->request->post()) {
            // Gələn məlumatları formModel-ə yükləyirik
            $formModel->load(Yii::$app->request->post());

            // Verilən tarixlər arasında valyutaları alırıq
            $model = $model->getCurrencyBetweenDates($formModel->dateFrom, $formModel->dateTo, $formModel->currencyCode);

            // Məlumatları sessiyada saxlayırıq (cache əvəzinə session istifadə edirik)
            Yii::$app->session->set('cachedData', ['formModel' => $formModel, 'model' => $model]);

            // Yenidən səhifəni render edirik
            return $this->render('custom', ['formModel' => $formModel, 'model' => $model]);
        }

        // Əgər export true-dursa, sessiyadakı məlumatları export edirik
        if ($export == true) {
            $cachedData = Yii::$app->session->get('cachedData');

            // Sessiyada saxlanmış məlumat yoxlanılır
            if ($cachedData) {
                $this->currencyExportHelper->exportCustomRates($cachedData);
            } else {
                // Əgər sessiyada məlumat yoxdursa, error göstərin və ya redirect edin
                Yii::$app->session->setFlash('error', 'Məlumat tapılmadı! Zəhmət olmasa, məlumatları yenidən göndərin.');
                return $this->redirect(['custom']);
            }
        }

        // Default olaraq home/index-ə yönləndiririk
        return $this->redirect(['home/index']);
    }

    public function actionXml(string $date)
    {
        $model = $this->currencyRatesViewModel;
        if ($date and DateHelper::checkDate($date, 'd.m.Y')) {
            $model->lastCurrency = $model->currencyRatesModel::getCurrencyByDate($date, 'd.m.Y');
            Yii::$app->response->format = \yii\web\Response::FORMAT_RAW;
            Yii::$app->response->headers->add('Content-Type', 'application/xml');
            if (isset($model->lastCurrency)) {
                echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
                return $this->renderPartial('xml', ['model' => $model]);
            } else {
                return $this->redirect(['home/index']);
            }
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionToday()
    {
        $date = date("d.m.Y");
        $url = "https://www.cbar.az/currencies/$date.xml";

        // Забираем XML
        $data = @file_get_contents($url);

        if ($data === false) {
            \Yii::$app->response->statusCode = 500;
            return "Cannot load XML";
        }

        // Отдаём как есть
        \Yii::$app->response->format = \yii\web\Response::FORMAT_RAW;
        \Yii::$app->response->headers->add('Content-Type', 'text/xml; charset=utf-8');

        return $data;
    }

}
