<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use Yii;
use admin\behaviors\PositionBehavior;
use admin\behaviors\UploadAssetsBehavior;

class OrganizationDivisions extends MainModel
{

    public static function tableName()
    {
        return 'organization_divisions';
    }

    public function behaviors()
    {
        return array_merge(parent::behaviors(), [
            'positionBehavior' => [
                'class' => PositionBehavior::className(),
                'positionAttribute' => 'position',
            ],
            'UploadAssetsBehavior' => [
                'class' => UploadAssetsBehavior::className(),
                'attributes' => ['filename_az', 'filename_en'],
                'folder' => 'organization',
            ],
        ]);
    }

    public function rules()
    {
        return [
            [['creator_id', 'position', 'active'], 'integer', 'on' => ['add', 'default']],
            [['title_az', 'title_en', 'director_name_az', 'director_name_en', 'director_email'], 'required', 'on' => ['add', 'default']],
            [['created_at', 'updated_at'], 'safe', 'on' => ['add', 'default']],
            [['title_az', 'title_en', 'director_name_az', 'director_name_en', 'director_position_az', 'director_position_en', 'director_email'], 'string', 'max' => 255, 'on' => ['add', 'default']],
            ['director_email', 'email', 'on' => ['add', 'default']],
            [['creator_id'], 'exist', 'skipOnError' => true, 'targetClass' => Users::className(), 'targetAttribute' => ['creator_id' => 'id'], 'on' => ['add', 'default']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'creator_id' => 'Creator ID',
            'title_az' => Yii::t('model', 'Name-Az'),
            'title_en' => Yii::t('model', 'Name-En'),
            'director_name_az' => Yii::t('model', 'Director-Name-AZ'),
            'director_name_en' => Yii::t('model', 'Director-Name-EN'),
            'director_position_az' => Yii::t('model', 'Director-Position-AZ'),
            'director_position_en' => Yii::t('model', 'Director-Position-EN'),
            'director_email' => Yii::t('model', 'Director-Email'),
            'position' => Yii::t('model', 'Position'),
            'filename_az' => Yii::t('model', 'Choose-File'),
            'filename_en' => Yii::t('model', 'Choose-File-EN'),
            'active' => Yii::t('model', 'Status'),
            'created_at' => Yii::t('model', 'Created-Date'),
            'updated_at' => Yii::t('model', 'Updated-Date'),
        ];
    }

    public function getDivisions()
    {
        return self::find()->where(['active' => '1'])->orderBy(['position' => SORT_ASC])->asArray()->all();
    }

    public function getCreator()
    {
        return $this->hasOne(Users::className(), ['id' => 'creator_id']);
    }
}
