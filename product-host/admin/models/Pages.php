<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace admin\models;

use Yii;
use yii\behaviors\SluggableBehavior;
use yii\db\ActiveRecord;
use kartik\tree\models\Tree;

class Pages extends Tree
{

    public $icon = false;
    public $icon_type = false;
    public $child_allowed = false;

    public function init()
    {
        parent::init();
        $this->show_az = 1;
        $this->show_en = 1;
        $this->show_footer = 0;
    }

    public function behaviors()
    {
        return array_merge(parent::behaviors(), [
            'timestamp' => [
                'class' => 'yii\behaviors\TimestampBehavior',
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['created_at', 'updated_at'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['updated_at'],
                ],
                'value' => new \yii\db\Expression('NOW()'),
            ],
            'slugable' => [
                'class' => SluggableBehavior::className(),
                'attribute' => 'title_en',
            ],
        ]);

    }

    public function beforeSave($insert)
    {
        $this->setCreatorID();
        return parent::beforeSave($insert);
    }

    public static function tableName()
    {
        return 'pages';
    }

    public function rules()
    {
        $rules = parent::rules();
        $rules[] = [['title_az', 'title_en', 'content_az', 'content_en', 'url'], 'string'];
        $rules[] = [['show_az', 'show_en', 'show_footer'], 'boolean'];
        $rules[] = [['title_az', 'title_en'], 'required'];
        return $rules;
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'parent_id' => 'Parent ID',
            'title_az' => Yii::t('model', 'Name-Az'),
            'title_en' => Yii::t('model', 'Name-En'),
            'content_az' => Yii::t('model', 'Description-Az'),
            'content_en' => Yii::t('model', 'Description-En'),
            'url' => Yii::t('model', 'URL'),
            'active' => Yii::t('kvtree', 'Active'),
            'selected' => Yii::t('kvtree', 'Selected'),
            'disabled' => Yii::t('kvtree', 'Disabled'),
            'readonly' => Yii::t('kvtree', 'Read Only'),
            'visible' => Yii::t('kvtree', 'Visible'),
            'collapsed' => Yii::t('kvtree', 'Collapsed'),
            'movable_u' => Yii::t('kvtree', 'Movable Up'),
            'movable_d' => Yii::t('kvtree', 'Movable Down'),
            'movable_l' => Yii::t('kvtree', 'Movable Left'),
            'movable_r' => Yii::t('kvtree', 'Movable Right'),
            'removable' => Yii::t('kvtree', 'Removable'),
            'removable_all' => Yii::t('kvtree', 'Removable (with children)'),
            'show_az' => Yii::t('model', 'Show (AZ)'),
            'show_en' => Yii::t('model', 'Show (En)'),
            'show_footer' => Yii::t('model', 'Show on footer'),
        ];
    }

    /* Формируем и указываем ID пользователя, который работает над записями */
    private function setCreatorID()
    {
        if ($this->hasAttribute('creator_id')) {
            return $this->setAttribute('creator_id', Yii::$app->user->identity->id);
        }
    }

}