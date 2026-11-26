<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\helpers;

use Yii;
use PHPExcel_Style_Alignment;
use common\helpers\DateHelper;

class IndeksExportHelper
{

    private $data = [];
    private $titles = [];
    private $filename;
    private $sheetTitle;

    private function setData(array $data)
    {
        $this->data = $data;
        return $this;
    }

    private function setTitles(array $titles)
    {
        $this->titles = $titles;
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
                    'data' => $this->data,
                    'titles' => $this->titles,
                    'styles' => [
                        'A1:D1' => [
                            'font' => [
                                'color' => ['rgb' => '1C3651'],
                                'bold' => true,
                                'size' => 13,
                                'center' => 'true',
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

    public function exportRates(array $model)
    {
        $data = [];
        foreach ($model as $row) {
            $data[] = [
                DateHelper::showDate($row['date']),
                $row['faiz_az'],
                $row['eqd_hecm_az'],
                $row['eqd_say_az']
            ];
        }
        $this->setData($data)
            ->setTitles([
                Yii::t('app', 'Tarix'), Yii::t('app', 'Faiz'), Yii::t('app', 'Əqdlərin həcmi'), Yii::t('app', 'Əqdlərin sayı')
            ])
            ->setSheetTitle('1D AZIR')
            ->setFileName(Yii::t('app', 'AZIR Chart Title'))
            ->toExcel();
    }


}