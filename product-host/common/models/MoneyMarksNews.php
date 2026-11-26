<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use Yii;
use yii\behaviors\SluggableBehavior;

class MoneyMarksNews extends MainModel
{

    public static function tableName()
    {
        return 'money_marks_news';
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
            [['date', 'title_az', 'created_at', 'updated_at'], 'string', 'on' => 'view'],
            /* Правила валидации для Add и Default */
            [['creator_id', 'active'], 'integer', 'on' => ['add', 'default']],
            [['content_az', 'content_en'], 'string', 'on' => ['add', 'default']],
            [['created_at', 'updated_at'], 'safe', 'on' => ['add', 'default']],
            [['title_az', 'title_en', 'slug'], 'string', 'max' => 255, 'on' => ['add', 'default']],
            [['title_az', 'title_en', 'date', 'slug'], 'required', 'on' => ['add', 'default']],
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
            'content_az' => Yii::t('model', 'Description-Az'),
            'content_en' => Yii::t('model', 'Description-En'),
            'date' => Yii::t('model', 'Date'),
            'active' => Yii::t('model', 'Status'),
            'created_at' => Yii::t('model', 'Created-Date'),
            'updated_at' => Yii::t('model', 'Updated-Date'),
        ];
    }

    public function getCreator()
    {
        return $this->hasOne(Users::className(), ['id' => 'creator_id']);
    }

    public function getAllData()
    {
        return self::find()->where(['active' => '1'])->orderBy(['date' => SORT_DESC])->asArray()->all();
    }
}