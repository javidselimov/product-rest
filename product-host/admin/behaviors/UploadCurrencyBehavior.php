<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace admin\behaviors;

use Yii;
use yii\db\BaseActiveRecord;
use yii\web\UploadedFile;
use common\components\uploader\UploadBehavior;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;

class UploadCurrencyBehavior extends UploadBehavior
{

    /* @var array */
    protected $allowedExtension = ['xlsx'];

    public function afterValidate()
    {
        $this->saveTempFile();
    }

    public function beforeSave()
    {
        $this->importFields();
    }

    public function afterSave()
    {
        $this->unlinkTempFile();
    }

    private function saveTempFile()
    {
        /** @var BaseActiveRecord $model */
        $model = $this->owner;
        foreach ($this->attributes as $attribute) {
            $instance = UploadedFile::getInstance($model, $attribute);
            if ($instance) {
                $fileName = 'currency.xlsx';
                //Сохраняем файл
                $instance->saveAs($this->folder . '/' . $fileName);
                //Придаем значение для сохранения в БД
                $model->$attribute = $fileName;
            }
        }
    }

    private function importFields()
    {
        /** @var BaseActiveRecord $model */
        $model = $this->owner;
        foreach ($this->attributes as $attribute) {
            if ($model->$attribute) {
                $reader = new Xlsx();
                $inputFileName = Yii::getAlias($this->folder . '/' . $model->$attribute);
                $spreadsheet = $reader->load($inputFileName);
                $columnsData = $spreadsheet->getActiveSheet()->rangeToArray('B7:G100', null, true, false, true);
                foreach ($columnsData as $column) {
                    if (isset($column['B']) and strlen($column['B']) == 3)
                    {
                        $modelField = strtolower($column['B']);
                        if ($model->hasAttribute($modelField))
                        {
                            $model[$modelField] = round($column['G'], 4);
                            //Временное решение для SDR
                            //$model['sdr'] = round($columnsData['41']['G'], 4); this is get value from fixed index; no flexible solution
                        }

                        if (strtoupper($column['B']) == "XDR")
                        {       // ✅ ищем SDR по коду
                            $model['sdr'] = round($column['G'], 4);
                        }
                    }
                }
            }
        }
    }

    private function unlinkTempFile()
    {
        /** @var BaseActiveRecord $model */
        $model = $this->owner;
        foreach ($this->attributes as $attribute) {
            unlink(Yii::getAlias($this->folder . '/' . $model->$attribute));
        }
    }

}