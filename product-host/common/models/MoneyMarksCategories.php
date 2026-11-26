<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use Yii;
use yii\behaviors\SluggableBehavior;

class MoneyMarksCategories extends MainModel
{

    public static function tableName()
    {
        return 'money_marks_categories';
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
            [['title_az', 'date', 'created_at', 'updated_at'], 'string', 'on' => 'view'],
            [['position', 'active'], 'integer', 'on' => 'view'],
            /* Правила валидации для Add и Default */
            [['creator_id', 'active'], 'integer', 'on' => ['add', 'default']],
            [['title_az', 'title_en', 'slug'], 'required', 'on' => ['add', 'default']],
            [['description_az', 'description_en'], 'string', 'on' => ['add', 'default']],
            [['created_at', 'updated_at'], 'safe', 'on' => ['add', 'default']],
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
            'title_az' => Yii::t('model', 'Name-Az'),
            'title_en' => Yii::t('model', 'Name-En'),
            'description_az' => Yii::t('model', 'Description-Az'),
            'description_en' => Yii::t('model', 'Description-En'),
            'active' => Yii::t('model', 'Active'),
            'created_at' => Yii::t('model', 'Created-Date'),
            'updated_at' => Yii::t('model', 'Updated-Date'),
        ];
    }

    public function getMoneyMarks()
    {
        return $this->hasMany(MoneyMarks::className(), ['category_id' => 'id']);
    }

    public function getCreator()
    {
        return $this->hasOne(Users::className(), ['id' => 'creator_id']);
    }
}