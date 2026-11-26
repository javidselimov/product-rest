<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use Yii;
use yii\behaviors\SluggableBehavior;
use admin\behaviors\PositionBehavior;
use common\components\uploader\UploadImageBehavior;

class MoneyMarks extends MainModel
{

    public static function tableName()
    {
        return 'money_marks';
    }

    public function behaviors()
    {
        return array_merge(parent::behaviors(), [
            'slugable' => [
                'class' => SluggableBehavior::className(),
                'attribute' => 'title_en',
            ],
            'positionBehavior' => [
                'class' => PositionBehavior::className(),
                'positionAttribute' => 'position',
                'groupAttributes' => [
                    'type',
                    'category_id',
                ],
            ],
            'uploadImageBehavior' => [
                'class' => UploadImageBehavior::className(),
                'attributes' => ['front_image', 'rear_image'],
                'resizeWidth' => '800',
                'folder' => 'money-marks',
            ],
        ]);
    }

    public function rules()
    {
        return [
            /* Правила валидации для GridView */
            [['title_az', 'date', 'created_at', 'updated_at'], 'string', 'on' => 'view'],
            [['position', 'active'], 'integer', 'on' => 'view'],
            /* Правила валидации для Add и Default */
            [['creator_id', 'category_id', 'type', 'position', 'active'], 'integer', 'on' => ['add', 'default']],
            [['title_az', 'title_en', 'slug'], 'required', 'on' => ['add', 'default']],
            [['front_image', 'rear_image'], 'required', 'on' => ['add']],
            [['description_az', 'description_en', 'secure_az', 'secure_en'], 'string', 'on' => ['add', 'default']],
            [['created_at', 'updated_at'], 'safe', 'on' => ['add', 'default']],
            [['title_az', 'title_en', 'slug'], 'string', 'max' => 255, 'on' => ['add', 'default']],
            [['video_url'], 'url'],
            [['category_id'], 'exist', 'skipOnError' => true, 'targetClass' => MoneyMarksCategories::className(), 'targetAttribute' => ['category_id' => 'id'], 'on' => ['add', 'default']],
            [['creator_id'], 'exist', 'skipOnError' => true, 'targetClass' => Users::className(), 'targetAttribute' => ['creator_id' => 'id'], 'on' => ['add', 'default']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'creator_id' => 'Creator ID',
            'category_id' => 'Category ID',
            'slug' => 'Slug',
            'type' => Yii::t('model', 'Type'),
            'title_az' => Yii::t('model', 'Name-Az'),
            'title_en' => Yii::t('model', 'Name-En'),
            'front_image' => Yii::t('model', 'Front-Image'),
            'rear_image' => Yii::t('model', 'Rear-Image'),
            'description_az' => Yii::t('model', 'Description-Az'),
            'description_en' => Yii::t('model', 'Description-En'),
            'secure_az' => Yii::t('model', 'Secure-Elements-AZ'),
            'secure_en' => Yii::t('model', 'Secure-Elements-EN'),
            'video_url' => Yii::t('model', 'URL'),
            'position' => Yii::t('model', 'Position'),
            'active' => Yii::t('model', 'Active'),
            'created_at' => Yii::t('model', 'Created-Date'),
            'updated_at' => Yii::t('model', 'Updated-Date'),
        ];
    }

    public function getCategory()
    {
        return $this->hasOne(MoneyMarksCategories::className(), ['id' => 'category_id']);
    }

    public function getCreator()
    {
        return $this->hasOne(Users::className(), ['id' => 'creator_id']);
    }
}