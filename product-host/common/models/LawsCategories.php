<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use Yii;
use yii\db\ActiveRecord;

/**
 *
 * @property int $id
 * @property int $creator_id
 * @property string $title_az
 * @property string $title_en
 * @property string $created_at
 * @property string $updated_at
 *
 * @property Laws[] $laws
 * @property Users $creator
 */
class LawsCategories extends MainModel
{

    public static function tableName()
    {
        return 'laws_categories';
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
        ];
    }

    public function rules()
    {
        return [
            [['creator_id'], 'default', 'value' => null, 'on' => ['add', 'default']],
            [['creator_id'], 'integer', 'on' => ['add', 'default']],
            [['title_az', 'title_en'], 'required', 'on' => ['add', 'default']],
            [['created_at', 'updated_at'], 'safe', 'on' => ['add', 'default']],
            [['title_az', 'title_en'], 'string', 'max' => 255, 'on' => ['add', 'default']],
            [['creator_id'], 'exist', 'skipOnError' => true, 'targetClass' => Users::className(), 'targetAttribute' => ['creator_id' => 'id'], 'on' => ['add', 'default']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => Yii::t('model', 'ID'),
            'creator_id' => Yii::t('model', 'Creator ID'),
            'title_az' => Yii::t('model', 'Name-Az'),
            'title_en' => Yii::t('model', 'Name-En'),
            'created_at' => Yii::t('model', 'Created-Date'),
            'updated_at' => Yii::t('model', 'Updated-Date'),
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getLaws()
    {
        return $this->hasMany(Laws::className(), ['category_id' => 'id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getCreator()
    {
        return $this->hasOne(Users::className(), ['id' => 'creator_id']);
    }
}
