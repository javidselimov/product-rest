<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use Yii;
use common\components\identity\UserIdentity;
use common\components\uploader\UploadImageBehavior;

class PressRelizQuestionValue extends MainModel
{
    public $newPassword;

    public static function tableName()
    {
        return 'press_reliz_statistics';
    }

    public function behaviors()
    {
        return [
            'uploadImageBehavior' => [
                'class' => UploadImageBehavior::className(),
                'attributes' => ['avatar'],
                'resizeWidth' => '128',
                'folder' => 'avatars',
            ],
        ];
    }

    public function rules()
    {
        return [
            /* Правила валидации для View */

        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => Yii::t('model', 'ID'),
            'role' => Yii::t('model', 'Role'),
            'username' => Yii::t('model', 'Username'),
            'email' => Yii::t('model', 'Email'),
            'password' => Yii::t('model', 'Password'),
            'newPassword' => Yii::t('model', 'Password-New'),
            'active' => Yii::t('model', 'Status'),
            'avatar' => Yii::t('model', 'Avatar'),
            'access_token' => Yii::t('model', 'Access Token'),
            'expire_at' => Yii::t('model', 'Expire at'),
        ];
    }

    /* Задаем безопасный хэш для пароля */
    private function setPassword()
    {
        $userIdentity = new UserIdentity();
        if ($this->scenario == 'add')
            $this->password = $userIdentity->setPassword($this->password);
        elseif ($this->newPassword)
            $this->password = $userIdentity->setPassword($this->newPassword);
    }

    public function beforeSave($insert)
    {
        $this->setPassword();
        return parent::beforeSave($insert);
    }

}
