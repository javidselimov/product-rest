<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use Yii;
use yii\behaviors\SluggableBehavior;
use admin\behaviors\PositionBehavior;

class Gallery extends MainModel
{

    public static function tableName()
    {
        return 'gallery';
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
            [['creator_id', 'position', 'active'], 'integer', 'on' => ['add', 'default']],
            [['date', 'title_az', 'title_en', 'slug'], 'required', 'on' => ['add', 'default']],
            [['date', 'created_at', 'updated_at'], 'safe', 'on' => ['add', 'default']],
            [['content_az', 'content_en'], 'string', 'on' => ['add', 'default']],
            [['title_az', 'title_en', 'slug'], 'string', 'max' => 255, 'on' => ['add', 'default']],
            [['creator_id'], 'exist', 'skipOnError' => true, 'targetClass' => Users::className(), 'targetAttribute' => ['creator_id' => 'id'], 'on' => ['add', 'default']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'creator_id' => 'Creator ID',
            'slug' => 'Slug',
            'date' => Yii::t('model', 'Date'),
            'title_az' => Yii::t('model', 'Name-Az'),
            'title_en' => Yii::t('model', 'Name-En'),
            'content_az' => Yii::t('model', 'Description-Az'),
            'content_en' => Yii::t('model', 'Description-En'),
            'position' => Yii::t('model', 'Position'),
            'active' => Yii::t('model', 'Active'),
            'visible' => Yii::t('model', 'Visible'),
            'created_at' => Yii::t('model', 'Created-Date'),
            'updated_at' => Yii::t('model', 'Updated-Date'),
        ];
    }

    public function getCreator()
    {
        return $this->hasOne(Users::className(), ['id' => 'creator_id']);
    }

    public function getGalleryImages()
    {
        return $this->hasMany(GalleryImages::className(), ['gallery_id' => 'id'])->orderBy(['position' => SORT_ASC]);
    }

    public function getCoverImage()
    {
        return $this->hasOne(GalleryImages::className(), ['gallery_id' => 'id'])->orderBy(['position' => SORT_ASC]);
    }

    public function getAllData()
    {
        return self::find()->where(['active' => '1'])->andWhere(['<=', 'date', date('Y-m-d')])->with(['coverImage'])->orderBy(['date' => SORT_DESC])->all();
    }

    public function getRecordByID(int $id)
    {
        return self::find()->where(['id' => $id, 'active' => '1'])->with(['galleryImages'])->one();
    }
}
