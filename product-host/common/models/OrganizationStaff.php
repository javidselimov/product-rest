<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use Yii;
use common\components\uploader\UploadImageBehavior;
use admin\behaviors\PositionBehavior;

class OrganizationStaff extends MainModel
{

    public static function tableName()
    {
        return 'organization_staff';
    }

    public function behaviors()
    {
        return array_merge(parent::behaviors(), [
            'positionBehavior' => [
                'class' => PositionBehavior::className(),
                'positionAttribute' => 'position',
                'groupAttributes' => [
                    'type',
                ],
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
            [['creator_id', 'type', 'position', 'active'], 'integer', 'on' => ['add', 'default']],
            [['name_az', 'name_en', 'type', 'job_az', 'job_en'], 'required', 'on' => ['add', 'default']],
            [['about_az', 'about_en'], 'string', 'on' => ['add', 'default']],
            [['created_at', 'updated_at'], 'safe', 'on' => ['add', 'default']],
            [['photo'], 'required', 'on' => ['add']],
            [['name_az', 'name_en', 'job_az', 'job_en', 'phone', 'reception_days_az', 'reception_days_en'], 'string', 'max' => 255, 'on' => ['add', 'default']],
            [['creator_id'], 'exist', 'skipOnError' => true, 'targetClass' => Users::className(), 'targetAttribute' => ['creator_id' => 'id'], 'on' => ['add', 'default']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'creator_id' => 'Creator ID',
            'name_az' => Yii::t('model', 'S.A.A-Az'),
            'name_en' => Yii::t('model', 'S.A.A-En'),
            'job_az' => Yii::t('model', 'Staff-Job-Az'),
            'job_en' => Yii::t('model', 'Staff-Job-En'),
            'type' => Yii::t('model', 'Staff-Type'),
            'position' => Yii::t('model', 'Position'),
            'phone' => Yii::t('model', 'Phone-Main'),
            'photo' => Yii::t('model', 'Image'),
            'about_az' => Yii::t('model', 'Description-Az'),
            'about_en' => Yii::t('model', 'Description-En'),
            'reception_days_az' => Yii::t('model', 'Reception-Days-Az'),
            'reception_days_en' => Yii::t('model', 'Reception-Days-En'),
            'active' => Yii::t('model', 'Status'),
            'created_at' => Yii::t('model', 'Created-Date'),
            'updated_at' => Yii::t('model', 'Updated-Date'),
        ];
    }

    public function getStaffByType(int $type)
    {
        return self::find()->where(['type' => $type, 'active' => '1'])->orderBy(['position' => SORT_ASC])->asArray()->all();
    }

    public function getCreator()
    {
        return $this->hasOne(Users::className(), ['id' => 'creator_id']);
    }
}
