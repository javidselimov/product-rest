<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use Yii;
use common\components\uploader\UploadImageBehavior;
use admin\behaviors\PositionBehavior;
use admin\behaviors\UploadAssetsBehavior;

class OrganizationOffices extends MainModel
{

    public static function tableName()
    {
        return 'organization_offices';
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
            'uploadImageBehavior' => [
                'class' => UploadImageBehavior::className(),
                'attributes' => ['photo'],
                'resizeWidth' => '1200',
                'folder' => 'organization',
            ],
        ]);
    }

    public function rules()
    {
        return [
            [['creator_id', 'position', 'active'], 'integer', 'on' => ['add', 'default']],
            [['title_az', 'title_en', 'director_name_az', 'director_name_en', 'adress_az', 'adress_en', 'phone'], 'required', 'on' => ['add', 'default']],
            [['filename_az', 'photo'], 'required', 'on' => ['add']],
            [['created_at', 'updated_at'], 'safe', 'on' => ['add', 'default']],
            [['title_az', 'title_en', 'director_name_az', 'director_name_en', 'adress_az', 'adress_en', 'phone'], 'string', 'max' => 255, 'on' => ['add', 'default']],
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
            'position' => Yii::t('model', 'Position'),
            'photo' => Yii::t('model', 'Image'),
            'adress_az' => Yii::t('model', 'Adress-Az'),
            'adress_en' => Yii::t('model', 'Adress-En'),
            'phone' => Yii::t('model', 'Phone-Main'),
            'filename_az' => Yii::t('model', 'Choose-File'),
            'filename_en' => Yii::t('model', 'Choose-File-EN'),
            'active' => Yii::t('model', 'Status'),
            'created_at' => Yii::t('model', 'Created-Date'),
            'updated_at' => Yii::t('model', 'Updated-Date'),
        ];
    }

    public function getOffices()
    {
        return self::find()->where(['active' => '1'])->orderBy(['position' => SORT_ASC])->asArray()->all();
    }

    public function getCreator()
    {
        return $this->hasOne(Users::className(), ['id' => 'creator_id']);
    }
}
