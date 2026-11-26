<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace admin\behaviors;

use Yii;
use yii\web\UploadedFile;
use common\components\uploader\UploadBehavior;

class UploadAssetsBehavior extends UploadBehavior
{

    /* @var array */
    public $allowedExtension = ['jpg', 'png', 'gif', 'xlsx', 'xls', 'doc', 'docx', 'zip', 'rar', 'pdf', 'xml'];

    public function beforeSave()
    {
        /** @var \common\models\PagesAssets $model */
        $model = $this->owner;
        foreach ($this->attributes as $attribute) {
            $instance = UploadedFile::getInstance($model, $attribute);
            if ($instance) {
                $fileName = $this->setAssetName($model, $attribute, $instance);
                //Сохраняем файл
                if ($instance->saveAs($this->folder . '/' . $fileName)) {
                    //Придаем значение для сохранения в БД
                    $model->$attribute = $fileName;
                }
            }
        }
    }

    public function setAssetName($model, $attribute, $instance)
    {
        /** @var \common\models\PagesAssets $model */
        /** @var \yii\web\UploadedFile $instance */
        if ($model->isNewRecord) {
            return $this->setFileName($instance->extension);
        } else {
            //Удаляем старый файл
            $this->unlink($this->folder . '/' . $model->$attribute);
            $fileName = substr($model->$attribute, 0, strrpos($model->$attribute, "."));
            return $fileName . Yii::getAlias('@dot') . $instance->extension;
        }

    }

}