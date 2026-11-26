<?

/*
 * Developed by Safaroff
*/

namespace visitor\controllers;


use common\models\YCParams;
use common\models\YCPeriods;
use common\models\YCYields;
use Yii;
use yii\web\BadRequestHttpException;
use common\models\InfoLines;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class HomeController extends MainController
{

    public function actionDownloaddata()
    {
//        $dates= Yii::$app->request->get()['dates'];
//        $data=explode(  ',',$dates);
//        $yields=YieldCurve::find()->where(['in','date',$data])->all();
        $yields = YCPeriods::find()->orderBy(['date' => SORT_DESC])->all();

        $vv = [];
        $vv[0][] = 'date';
        $vv[0][] = '3 ay';
        $vv[0][] = '6 ay';
        $vv[0][] = '9 ay';
        $vv[0][] = '1 il';
        $vv[0][] = '2 il';
        $vv[0][] = '3 il';
        $vv[0][] = '4 il';
        foreach ($yields as $yield) {
            $vv[$yield->date]['date'] = $yield->date;
            $vv[$yield->date][] = $yield->three_month;
            $vv[$yield->date][] = $yield->six_month;
            $vv[$yield->date][] = $yield->nine_month;
            $vv[$yield->date][] = $yield->one_year;
            $vv[$yield->date][] = $yield->two_year;
            $vv[$yield->date][] = $yield->three_year;
            $vv[$yield->date][] = $yield->four_year;
        }

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->fromArray($vv, null, 'A1');
        $writer = new Xlsx($spreadsheet);
        $filePath = 'download.xlsx';
        $writer->save($filePath);
    }

    public function actionYield()
    {
        $data = Yii::$app->request->get()['name'];
        $secilenTarih = Yii::$app->request->get()['secilenTarih'];
        $data = explode(',', $data);
        $arrs = [];
        foreach ($data as $dd) {
            $vv = [];
            $yields = YCYields::find()->where(['date' => $dd])->orderBy(['id' => SORT_ASC])->all();
            foreach ($yields as $key => $v) {
                $vv[$key]['x'] = $v->period;
                $vv[$key]['y'] = $v->profitability;
            }
            $rand = str_pad(dechex(rand(0x000000, 0xFFFFFF)), 6, 0, STR_PAD_LEFT);
            $rand = '#' . $rand;
            $arrs[] = [
                'values' => $vv,
                'key' => $dd,
                'color' => $rand
            ];
        }
        $params = [];
        $yyields = [];
        $parametres = YCParams::find()->where(['in', 'date', $data])->all();
        foreach ($parametres as $yield) {
            $params[$yield->date] = $yield;
        }
        $periodlar = YCPeriods::find()->where(['in', 'date', $data])->all();
        $periods = [];
        foreach ($periodlar as $yield) {
            $periods[$yield->date] = $yield->attributes;
        }

        echo json_encode([
            'yield' => $arrs,
            'params' => $params[$secilenTarih]->attributes,
            'yyields' => $periods
        ]);
        exit;
    }

    public function actionChart()
    {
        try {
            return $this->render('chart');
        } catch (\Exception $e) {
            echo $e->getMessage();
            exit;
        }
    }

    public function actionIndex()
    {
        return $this->render('index');
    }

    public function actionSitemap()
    {
        return $this->render('sitemap');
    }

    public function actionMoneyMarketChart()
    {
        if (Yii::$app->request->isAjax) {
            $connection = Yii::$app->db;
            $deyer = 1;
            $command = $connection->createCommand('SELECT * FROM settings_saf');
            $res = $command->queryAll();

            $check = false;
            $gosterme = false;
            $deyer = '';
            foreach ($res as $key => $value) {
                if ($value['key'] == 'show_7gunluk') {
                    $check = true;
                    $deyer = $value;
                }
            }

            if ($check == true && $deyer['value'] == 1) {
                return $this->asJson(
                    [
                        'labels' => [
                            "7" . Yii::t('other', 'days'),
                            "28" . Yii::t('other', 'days'),
                            "84" . Yii::t('other', 'days'),
                            "168" . Yii::t('other', 'days'),
                            "252" . Yii::t('other', 'days')
                        ],
                        'values' => [
                            str_replace('%', '', InfoLines::getLastValueByAlias('nots_levels_7')->value),
                            str_replace('%', '', InfoLines::getLastValueByAlias('nots_levels_28')->value),
                            str_replace('%', '', InfoLines::getLastValueByAlias('nots_levels_84')->value),
                            str_replace('%', '', InfoLines::getLastValueByAlias('nots_levels_168')->value),
                            str_replace('%', '', InfoLines::getLastValueByAlias('nots_levels_252')->value),
                        ]
                    ]
                );

            } else {
                return $this->asJson(
                    [
                        'labels' => [
                            "28" . Yii::t('other', 'days'),
                            "84" . Yii::t('other', 'days'),
                            "168" . Yii::t('other', 'days'),
                            "252" . Yii::t('other', 'days')
                        ],
                        'values' => [
                            str_replace('%', '', InfoLines::getLastValueByAlias('nots_levels_28')->value),
                            str_replace('%', '', InfoLines::getLastValueByAlias('nots_levels_84')->value),
                            str_replace('%', '', InfoLines::getLastValueByAlias('nots_levels_168')->value),
                            str_replace('%', '', InfoLines::getLastValueByAlias('nots_levels_252')->value),
                        ]
                    ]
                );

            }

        }
        throw new BadRequestHttpException();
    }

}