<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use Yii;
use yii\db\ActiveRecord;
use admin\behaviors\UploadAssetsBehavior;
use admin\behaviors\PositionBehavior;

class PagesAssets extends MainModel
{

    public static function tableName()
    {
        return 'pages_assets';
    }

    public function beforeSave($insert)
    {
        $this->setDefaultValues();
        return parent::beforeSave($insert);
    }

    public function behaviors()
    {
        return [
            'timestamp' => [
                'class' => 'yii\behaviors\TimestampBehavior',
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['created_at', 'updated_at'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['updated_at'],
                ],
                'value' => new \yii\db\Expression('NOW()'),
            ],
            'positionBehavior' => [
                'class' => PositionBehavior::className(),
                'positionAttribute' => 'position',
                'groupAttributes' => ['page_id',],
            ],
            'UploadAssetsBehavior' => [
                'class' => UploadAssetsBehavior::className(),
                'attributes' => ['filename_az', 'filename_en'],
                'folder' => 'assets',
            ],
        ];
    }

    public function rules()
    {
        return [
            /* Правила валидации для GridView */
            [['id', 'position', 'cover', 'visible'], 'integer', 'on' => 'view'],
            [['title_az', 'title_en', 'filename_az'], 'string', 'on' => 'view'],
            /* Правила валидации для Manage и Default */
            [['title_az', 'title_en'], 'required', 'on' => ['add', 'default']],
            [['filename_az'], 'required', 'on' => ['add']],
            [['page_id', 'creator_id'], 'default', 'value' => null, 'on' => ['add', 'default']],
            [['page_id', 'creator_id', 'position', 'cover', 'visible'], 'integer', 'on' => ['add', 'default']],
            [['created_at', 'updated_at'], 'safe', 'on' => ['add', 'default']],
            [['title_az', 'title_en'], 'string', 'max' => 255, 'on' => ['add', 'default']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'page_id' => 'Page ID',
            'creator_id' => 'Creator ID',
            'filename_az' => Yii::t('model', 'Choose-File'),
            'filename_en' => Yii::t('model', 'Choose-File-EN'),
            'title_az' => Yii::t('model', 'File-Title-AZ'),
            'title_en' => Yii::t('model', 'File-Title-EN'),
            'position' => Yii::t('model', 'Position-Number'),
            'cover' => Yii::t('model', 'Cover'),
            'visible' => Yii::t('model', 'Visible'),
            'created_at' => Yii::t('model', 'Created-Date'),
            'updated_at' => Yii::t('model', 'Updated-Date'),
        ];
    }

    private function setDefaultValues()
    {
        if ($this->scenario == 'add') {
            $this->visible = 1;
        }
    }
}
