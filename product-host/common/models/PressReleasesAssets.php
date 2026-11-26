<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use Yii;
use yii\db\ActiveRecord;
use admin\behaviors\PositionBehavior;
use admin\behaviors\UploadAssetsBehavior;

class PressReleasesAssets extends PagesAssets
{

    public static function tableName()
    {
        return 'press_releases_assets';
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
                'groupAttributes' => ['press_release_id',],
            ],
            'UploadAssetsBehavior' => [
                'class' => UploadAssetsBehavior::className(),
                'attributes' => ['filename_az', 'filename_en'],
                'folder' => 'press-releases',
            ],
        ];
    }

    public function rules()
    {
        return [
            /* Правила валидации для GridView */
            [['id', 'position', 'visible'], 'integer', 'on' => 'view'],
            [['title', 'title_en', 'filename_az', 'filename_en'], 'string', 'on' => 'view'],
            /* Правила валидации для Manage и Default */
            [['title', 'title_en'], 'required', 'on' => ['add', 'default']],
            [['filename_az', 'filename_en'], 'required', 'on' => ['add']],
            [['press_release_id', 'creator_id'], 'default', 'value' => null, 'on' => ['add', 'default']],
            [['press_release_id', 'creator_id', 'position', 'visible'], 'integer', 'on' => ['add', 'default']],
            [['created_at', 'updated_at'], 'safe', 'on' => ['add', 'default']],
            [['title', 'title_en'], 'string', 'max' => 255, 'on' => ['add', 'default']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'press_release_id' => 'Press Release ID',
            'creator_id' => 'Creator ID',
            'filename_az' => Yii::t('model', 'Choose-File'),
            'filename_en' => Yii::t('model', 'Choose-File-EN'),
            'title' => Yii::t('model', 'File-Title-AZ'),
            'title_en' => Yii::t('model', 'File-Title-EN'),
            'position' => Yii::t('model', 'Position-Number'),
            'visible' => Yii::t('model', 'Visible'),
            'created_at' => Yii::t('model', 'Created-Date'),
            'updated_at' => Yii::t('model', 'Updated-Date'),
        ];
    }

    public function getPressRelease()
    {
        return $this->hasOne(PressReleases::className(), ['id' => 'press_release_id']);
    }

    public function getCreator()
    {
        return $this->hasOne(Users::className(), ['id' => 'creator_id']);
    }
}