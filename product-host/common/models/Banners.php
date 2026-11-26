<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use Yii;
use yii\db\ActiveRecord;
use admin\behaviors\PositionBehavior;
use common\components\uploader\UploadImageBehavior;

class Banners extends MainModel
{

    public static function tableName()
    {
        return 'banners';
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
            ],
            'uploadImageBehavior' => [
                'class' => UploadImageBehavior::className(),
                'attributes' => ['background'],
                'resizeWidth' => '240',
                'folder' => 'banners',
            ],
        ];
    }

    public function rules()
    {
        return [
            /* Правила валидации для GridView */
            [['position', 'title_az', 'url', 'active'], 'safe', 'on' => 'view'],
            /* Правила валидации для Add и Default */
            [['created_at', 'updated_at'], 'safe', 'on' => ['add', 'default']],
            [['title_az', 'title_en', 'url'], 'required', 'on' => ['add', 'default']],
            // [['background'], 'required', 'on' => ['add']],
            [['title_az', 'title_en', 'url'], 'string', 'on' => ['add', 'default']],
            [['position', 'clean', 'active'], 'safe', 'on' => ['add', 'default']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'creator_id' => 'Creator ID',
            'title_az' => Yii::t('model', 'Name-Az'),
            'title_en' => Yii::t('model', 'Name-En'),
            'background' => Yii::t('model', 'Banners-Background'),
            'position' => Yii::t('model', 'Position'),
            'url' => Yii::t('model', 'URL'),
            'active' => Yii::t('model', 'Status'),
            'clean' => Yii::t('model', 'Clean'),
            'created_at' => Yii::t('model', 'Created-Date'),
            'updated_at' => Yii::t('model', 'Updated-Date'),
        ];
    }

    public static function getAllBanners()
    {
        return self::getDb()->cache(function ($db) {
            return self::find()->where(['active' => '1'])->orderBy('position')->all();
        }, Yii::$app->params['dbCacheTimeout']);
    }
}