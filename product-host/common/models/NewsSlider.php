<?

/*
 * Developed by Junie
 * © GT Solutions
 */

namespace common\models;

use Yii;
use yii\db\ActiveRecord;
use admin\behaviors\PositionBehavior;
use common\components\uploader\UploadImageBehavior;

class NewsSlider extends MainModel
{

    public static function tableName()
    {
        return 'news_slider';
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
                'positionAttribute' => 'ordering',
            ],
            'uploadImageBehavior' => [
                'class' => UploadImageBehavior::className(),
                'attributes' => ['image_path'],
                'resizeWidth' => '1920',
                'folder' => 'news_slider',
            ],
        ];
    }

    public function rules()
    {
        return [
            /* Правила валидации для GridView */
            [['ordering', 'title_az', 'title_en', 'is_active'], 'safe', 'on' => 'view'],
            
            /* Правила валидации для Add и Default */
            [['created_at', 'updated_at'], 'safe', 'on' => ['add', 'default']],
            [['title_az', 'title_en', 'news_date'], 'required', 'on' => ['add', 'default']],
            [['image_path'], 'required', 'on' => ['add']],
            [['title_az', 'title_en', 'link_az', 'link_en'], 'string', 'max' => 500, 'on' => ['add', 'default']],
            [['image_path'], 'safe', 'on' => ['add', 'default']],
            [['description_az', 'description_en'], 'string', 'on' => ['add', 'default']],
            [['news_date'], 'date', 'format' => 'php:Y-m-d', 'on' => ['add', 'default']],
            [['ordering'], 'integer', 'on' => ['add', 'default']],
            [['is_active'], 'boolean', 'on' => ['add', 'default']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'title_az' => Yii::t('model', 'Title') . ' (AZ)',
            'title_en' => Yii::t('model', 'Title') . ' (EN)',
            'description_az' => Yii::t('model', 'Description') . ' (AZ)',
            'description_en' => Yii::t('model', 'Description') . ' (EN)',
            'news_date' => Yii::t('model', 'Date'),
            'link_az' => Yii::t('model', 'URL') . ' (AZ)',
            'link_en' => Yii::t('model', 'URL') . ' (EN)',
            'image_path' => Yii::t('model', 'Image'),
            'ordering' => Yii::t('model', 'Position'),
            'is_active' => Yii::t('model', 'Status'),
            'created_at' => Yii::t('model', 'Created-Date'),
            'updated_at' => Yii::t('model', 'Updated-Date'),
        ];
    }

    public function changeRowStatus()
    {
        $this->is_active = $this->is_active ? 0 : 1;
        return $this->save(false);
    }
}
