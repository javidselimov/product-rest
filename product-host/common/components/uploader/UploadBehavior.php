<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\components\uploader;

use Yii;
use yii\base\Behavior;
use yii\db\BaseActiveRecord;
use yii\web\UploadedFile;

class UploadBehavior extends Behavior
{

    /* @var array */
    public $attributes = [];
    /* @var string */
    public $folder;
    /* @var integer */
    public $resizeWidth;
    /* @var integer */
    public $quality = 100;
    /* @var array */
    protected $allowedExtension = ['jpg', 'png', 'gif'];

    public function init()
    {
        $this->setPath();
        parent::init();
    }

    public function events()
    {
        return [
            BaseActiveRecord::EVENT_BEFORE_VALIDATE => 'beforeValidate',
            BaseActiveRecord::EVENT_BEFORE_INSERT => 'beforeSave',
            BaseActiveRecord::EVENT_BEFORE_UPDATE => 'beforeSave',
            BaseActiveRecord::EVENT_BEFORE_DELETE => 'beforeDelete',
            BaseActiveRecord::EVENT_AFTER_VALIDATE => 'afterValidate',
            BaseActiveRecord::EVENT_AFTER_INSERT => 'afterSave',
        ];
    }

    //Todo Refactor this later
    public function beforeValidate()
    {
        /** @var BaseActiveRecord $model */
        $model = $this->owner;
        foreach ($this->attributes as $attribute) {
            $instance = UploadedFile::getInstance($model, $attribute);
            if ($instance) {
                $this->checkExtension($instance->getExtension());
                if ($model->$attribute == null and $this->checkExtension($instance->getExtension())) {
                    $model->$attribute = $instance;
                }
            }
        }
    }

    public function afterValidate()
    {
    }

    public function beforeSave()
    {
    }

    public function afterSave()
    {
    }

    public function beforeDelete()
    {
        /** @var BaseActiveRecord $model */
        $model = $this->owner;
        foreach ($this->attributes as $attribute) {
            $file = $this->folder . '/' . $model->$attribute;
            if (is_file($file)) unlink($file);
        }
    }

    /* Проверяем допустимые типы файлов */
    protected function checkExtension($extension)
    {
        /** @var BaseActiveRecord $model */
        $model = $this->owner;
        if (!in_array($extension, $this->allowedExtension)) {
            $model->addError('extension', Yii::t('model', 'Extension-Error - {extensions}', ['extensions' => implode("/", $this->allowedExtension)]));
        } else {
            return true;
        }
    }

    /* Установка пути для сохранения файлов */
    protected function setPath()
    {
        $this->folder = Yii::getAlias(Yii::$app->params['uploadsDirectory'] . '/' . $this->folder);
        return $this->folder;
    }

    /* Генерация имени файла */
    protected function setFileName($extension)
    {
        $filename = substr(md5(uniqid(mt_rand(), true)), '0', '25');
        return $filename . Yii::getAlias('@dot') . $extension;
    }

    /* Удаление файлов */
    protected function unlink($file)
    {
        if (is_file($file)) unlink($file);
    }


}