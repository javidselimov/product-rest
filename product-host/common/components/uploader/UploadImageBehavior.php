<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\components\uploader;

use Yii;
use yii\db\BaseActiveRecord;
use yii\web\UploadedFile;

class UploadImageBehavior extends UploadBehavior
{

    /* @var array */
    protected $allowedExtension = ['jpg', 'png', 'gif'];

    public function beforeSave()
    {
        /** @var BaseActiveRecord $model */
        $model = $this->owner;
        foreach ($this->attributes as $attribute) {
            $instance = UploadedFile::getInstance($model, $attribute);
            if ($instance) {
                $tempName = $instance->tempName;
                $fileName = $this->setFileName($instance->extension);
                //Сохраняем изображения
                Yii::$app->imageResizer->load($tempName)
                    ->fit_to_width($this->resizeWidth)
                    ->save($this->folder . '/' . $fileName, $this->quality);
                
                $oldFile = $this->folder . '/' . $model->getOldAttribute($attribute);
                if ($model->getOldAttribute($attribute) && is_file($oldFile)) {
                    @unlink($oldFile);
                }
                
                //Придаем значение для сохранения в БД
                $model->$attribute = $fileName;
            } elseif (!$model->isNewRecord && empty($model->$attribute)) {
                $model->$attribute = $model->getOldAttribute($attribute);
            }
        }
    }

}