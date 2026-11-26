<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\helpers;

use Yii;
use yii\helpers\ArrayHelper;
use PHPExcel_Style_Alignment;
use common\helpers\DateHelper;
use visitor\viewmodels\CurrencyRatesViewModel;

class CurrencyExportHelper
{

    private $currencies = [];
    private $titles = [];
    private $date;
    private $filename;
    private $sheetTitle;

    private function setCurrencies(array $currencies)
    {
        $this->currencies = $currencies;
        return $this;
    }

    private function setTitles(array $titles)
    {
        $this->titles = $titles;
        return $this;
    }

    private function setDate(string $date)
    {
        $this->date = DateHelper::showDate($date, 'dd.MM.YYYY');
        return $this;
    }

    private function setFilename(string $filename)
    {
        $this->filename = $filename;
        return $this;
    }

    private function setSheetTitle(string $title)
    {
        $this->sheetTitle = $title;
        return $this;
    }

    private function toExcel()
    {
        $file = Yii::createObject([
            'class' => 'codemix\excelexport\ExcelFile',
            'sheets' => [
                $this->sheetTitle => [
                    'data' => $this->currencies,
                    'titles' => $this->titles,
                    'styles' => [
                        'A1:B1' => [
                            'font' => [
                                'color' => ['rgb' => '1C3651'],
                                'bold' => true,
                                'size' => 13,
                                'center' => 'true',
                            ],
                        ],
                        'A2:A50' => [
                            'font' => [
                                'bold' => true,
                            ],
                        ],
                        'A1:Z1000' => [
                            'alignment' => [
                                'horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_CENTER,
                            ],
                        ],
                    ],
                ],
            ],

        ]);
        return $file->send($this->filename . '.xlsx');
    }

    public function exportRates(CurrencyRatesViewModel $model)
    {
        $currenciesList = [];
        foreach (Yii::t('other', 'currencies') as $code => $title) {
            if ($model->lastCurrency[$code]) {
                $currenciesList[] = [$code == 'sdr' ? 'xdr' : strtoupper($code), $model->lastCurrency[$code]];
            }
        }
        $this->setCurrencies($currenciesList)
            ->setTitles([Yii::t('model', 'Code'), Yii::t('model', 'Rate')])
            ->setDate($model->lastCurrency['date'])
            ->setSheetTitle(Yii::t('app', 'AZN-Currency-Last'))
            ->setFileName(Yii::t('app', 'AZN-Currencies') . ' - ' . $this->date)
            ->toExcel();
    }

    public function exportCustomRates(array $cachedData)
    {
        $currenciesList = [];
        $dateFrom = str_replace("/", ".", $cachedData['formModel']['dateFrom']);
        $dateTo = str_replace("/", ".", $cachedData['formModel']['dateTo']);
        $currencyCode = $cachedData['formModel']['currencyCode'];

        $currencyName = ArrayHelper::getValue(Yii::t('other', 'currencies'), $currencyCode);

        foreach ($cachedData['model'] as $currency) {
            $currenciesList[] = [DateHelper::showDate($currency['date'], 'dd.MM.YYYY'), $currency[$currencyCode]];
        }

        $this->setCurrencies($currenciesList)
            ->setTitles([Yii::t('model', 'Date'), $currencyName])
            ->setSheetTitle($currencyName)
            ->setFileName($currencyName . ' - ' . $dateFrom . '-' . $dateTo)
            ->toExcel();
    }

}