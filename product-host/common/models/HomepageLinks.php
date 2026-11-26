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

class HomepageLinks extends MainModel
{

    public static function tableName()
    {
        return 'homepage_links';
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
                'attributes' => ['icon'],
                'resizeWidth' => '40',
                'folder' => 'homepage',
            ],
        ];
    }

    public function rules()
    {
        return [
            /* Правила валидации для GridView */
            [['position', 'title_az', 'url_az', 'active'], 'safe', 'on' => 'view'],
            /* Правила валидации для Add и Default */
            [['created_at', 'updated_at'], 'safe', 'on' => ['add', 'default']],
            [['title_az', 'title_en', 'url_az', 'url_en'], 'required', 'on' => ['add', 'default']],
            // [['icon'], 'required', 'on' => ['add']],
            [['title_az', 'title_en', 'url_az', 'url_en'], 'string', 'on' => ['add', 'default']],
            [['position', 'active'], 'safe', 'on' => ['add', 'default']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'creator_id' => 'Creator ID',
            'title_az' => Yii::t('model', 'Name-Az'),
            'title_en' => Yii::t('model', 'Name-En'),
            'icon' => Yii::t('model', 'Icon'),
            'position' => Yii::t('model', 'Position'),
            'url_az' => Yii::t('model', 'URL (AZ)'),
            'url_en' => Yii::t('model', 'URL (EN)'),
            'active' => Yii::t('model', 'Status'),
            'created_at' => Yii::t('model', 'Created-Date'),
            'updated_at' => Yii::t('model', 'Updated-Date'),
        ];
    }

    public static function getAllLinks()
    {
        return self::getDb()->cache(function ($db) {
            return self::find()->where(['active' => '1'])->orderBy('position')->all();
        }, Yii::$app->params['dbCacheTimeout']);
    }
}