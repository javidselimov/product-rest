<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use Yii;
use admin\behaviors\PositionBehavior;
use common\components\uploader\UploadImageBehavior;

class GalleryImages extends MainModel
{

    public static function tableName()
    {
        return 'gallery_images';
    }

    public function beforeSave($insert)
    {
        $this->setDefaultValues();
        return parent::beforeSave($insert);
    }

    public function behaviors()
    {
        return array_merge(parent::behaviors(), [
            'positionBehavior' => [
                'class' => PositionBehavior::className(),
                'positionAttribute' => 'position',
                'groupAttributes' => ['gallery_id',],
            ],
            'uploadImageBehavior' => [
                'class' => UploadImageBehavior::className(),
                'attributes' => ['filename'],
                'resizeWidth' => '1200',
                'folder' => 'photo-gallery',
            ],
        ]);
    }


    public function rules()
    {
        return [
            [['gallery_id', 'creator_id', 'position', 'active'], 'integer', 'on' => ['add', 'default']],
            [['filename'], 'required', 'on' => ['add']],
            [['created_at', 'updated_at'], 'safe', 'on' => ['add', 'default']],
            [['gallery_id'], 'exist', 'skipOnError' => true, 'targetClass' => Gallery::className(), 'targetAttribute' => ['gallery_id' => 'id'], 'on' => ['add', 'default']],
            [['creator_id'], 'exist', 'skipOnError' => true, 'targetClass' => Users::className(), 'targetAttribute' => ['creator_id' => 'id'], 'on' => ['add', 'default']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'gallery_id' => 'Gallery ID',
            'creator_id' => 'Creator ID',
            'filename' => Yii::t('model', 'Image'),
            'position' => Yii::t('model', 'Position-Number'),
            'active' => Yii::t('model', 'Active'),
            'created_at' => Yii::t('model', 'Created-Date'),
            'updated_at' => Yii::t('model', 'Updated-Date'),
        ];
    }

    public function getGallery()
    {
        return $this->hasOne(Gallery::className(), ['id' => 'gallery_id']);
    }

    public function getCreator()
    {
        return $this->hasOne(Users::className(), ['id' => 'creator_id']);
    }

    private function setDefaultValues()
    {
        if ($this->scenario == 'add') {
            $this->active = 1;
        }
    }
}
