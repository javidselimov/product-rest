<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use Yii;
use yii\behaviors\SluggableBehavior;
use himiklab\yii2\search\behaviors\SearchBehavior;

class PressReleases extends MainModel
{

    public function init()
    {
        parent::init();
        if ($this->isNewRecord) {
            $this->active = 0;
        }
    }

    public static function tableName()
    {
        return 'press_releases';
    }

    public function behaviors()
    {
        return array_merge(parent::behaviors(), [
            'slugable' => [
                'class' => SluggableBehavior::className(),
                'attribute' => 'title_en',
            ],
            'search' => [
                'class' => SearchBehavior::className(),
                'searchScope' => function ($model) {
                    /** @var \yii\db\ActiveQuery $model */
                    $model->select(['id', 'title_az', 'title_en', 'content_az', 'content_en', 'date', 'slug']);
                    $model->andWhere(['active' => '1']);
                    $model->andWhere(['<=', 'date', date('Y-m-d')]);
                },
                'searchFields' => function ($model) {
                    /** @var self $model */
                    return [
                        ['name' => 'pageID', 'value' => $model->id, 'type' => SearchBehavior::FIELD_UNINDEXED],
                        ['name' => 'title_az', 'value' => $model->title_az, 'type' => SearchBehavior::FIELD_TEXT],
                        ['name' => 'title_en', 'value' => $model->title_en, 'type' => SearchBehavior::FIELD_TEXT],
                        ['name' => 'content_az', 'value' => strip_tags($model->content_az), 'type' => SearchBehavior::FIELD_TEXT],
                        ['name' => 'content_en', 'value' => strip_tags($model->content_en), 'type' => SearchBehavior::FIELD_TEXT],
                        ['name' => 'date', 'value' => $model->date, 'type' => SearchBehavior::FIELD_UNINDEXED],
                        ['name' => 'slug', 'value' => $model->slug, 'type' => SearchBehavior::FIELD_UNINDEXED],
                        /* Указываем для уточнения модели */
                        ['name' => 'model', 'value' => 'press-releases', 'type' => SearchBehavior::FIELD_UNINDEXED],
                    ];
                },
            ],
        ]);
    }


    public function rules()
    {
        return [
            /* Правила валидации для GridView */
            [['date', 'title_az', 'created_at', 'updated_at'], 'string', 'on' => 'view'],
            [['type'], 'integer', 'on' => 'view'],
            /* Правила валидации для Add и Default */
            [['creator_id', 'active', 'type'], 'integer', 'on' => ['add', 'default']],
            [['content_az', 'content_en'], 'string', 'on' => ['add', 'default']],
            [['created_at', 'updated_at'], 'safe', 'on' => ['add', 'default']],
            [['title_az', 'title_en', 'slug'], 'string', 'max' => 255, 'on' => ['add', 'default']],
            [['title_az', 'title_en', 'date', 'type', 'slug'], 'required', 'on' => ['add', 'default']],
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
            'type' => Yii::t('model', 'Type'),
            'active' => Yii::t('model', 'Status'),
            'created_at' => Yii::t('model', 'Created-Date'),
            'updated_at' => Yii::t('model', 'Updated-Date'),
        ];
    }

    public function getCreator()
    {
        return $this->hasOne(Users::className(), ['id' => 'creator_id']);
    }

    public function getPressReleasesAssets()
    {
        return $this->hasMany(PressReleasesAssets::className(), ['press_release_id' => 'id'])->orderBy(['position' => SORT_DESC]);
    }
}