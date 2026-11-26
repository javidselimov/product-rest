<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use Yii;
use yii\behaviors\SluggableBehavior;

/**
 *
 * @property int $id
 * @property int $creator_id
 * @property int $category_id
 * @property int $type
 * @property string $title_az
 * @property string $title_en
 * @property string $description_az
 * @property string $description_en
 * @property string $slug
 * @property int $active
 * @property string $created_at
 * @property string $updated_at
 *
 * @property LawsCategories $category
 * @property Users $creator
 */
class Laws extends MainModel
{
    public static function tableName()
    {
        return 'laws';
    }

    public function behaviors()
    {
        return array_merge(parent::behaviors(), [
            'slugable' => [
                'class' => SluggableBehavior::className(),
                'attribute' => 'title_en',
            ],
        ]);
    }

    public function rules()
    {
        return [

            /* Правила валидации для GridView */
            [['title_az', 'created_at', 'updated_at'], 'string', 'on' => 'view'],
            [['type', 'active'], 'integer', 'on' => 'view'],
            /* Правила валидации для Add/modify */
            [['creator_id'], 'default', 'value' => null, 'on' => ['add', 'default']],
            [['creator_id', 'category_id', 'type', 'active'], 'integer', 'on' => ['add', 'default']],
            [['category_id', 'type', 'title_az', 'title_en', 'description_az', 'slug', 'active'], 'required', 'on' => ['add', 'default']],
            [['description_az', 'description_en'], 'string', 'on' => ['add', 'default']],
            [['created_at', 'updated_at'], 'safe', 'on' => ['add', 'default']],
            [['title_az', 'title_en', 'slug'], 'string', 'max' => 255, 'on' => ['add', 'default']],
            [['category_id'], 'exist', 'skipOnError' => true, 'targetClass' => LawsCategories::className(), 'targetAttribute' => ['category_id' => 'id'], 'on' => ['add', 'default']],
            [['creator_id'], 'exist', 'skipOnError' => true, 'targetClass' => Users::className(), 'targetAttribute' => ['creator_id' => 'id'], 'on' => ['add', 'default']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => Yii::t('model', 'ID'),
            'creator_id' => Yii::t('model', 'CreatorID'),
            'category_id' => Yii::t('model', 'Category ID'),
            'type' => Yii::t('model', 'Type'),
            'title_az' => Yii::t('model', 'Name-Az'),
            'title_en' => Yii::t('model', 'Name-En'),
            'description_az' => Yii::t('model', 'Description-Az'),
            'description_en' => Yii::t('model', 'Description-En'),
            'slug' => Yii::t('model', 'Slug'),
            'active' => Yii::t('model', 'Status'),
            'created_at' => Yii::t('model', 'Created-Date'),
            'updated_at' => Yii::t('model', 'Updated-Date'),
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getCategory()
    {
        return $this->hasOne(LawsCategories::className(), ['id' => 'category_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getCreator()
    {
        return $this->hasOne(Users::className(), ['id' => 'creator_id']);
    }
}
