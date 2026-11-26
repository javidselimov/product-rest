<?php

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use Yii;
use common\components\identity\UserIdentity;
use common\components\uploader\UploadImageBehavior;

class Users extends MainModel
{
    public $newPassword;
    public $currentPassword;

    public static function tableName()
    {
        return 'users';
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
            [['id', 'role', 'active'], 'integer', 'on' => 'view'],
            [['username'], 'string', 'on' => 'view'],
            [['email'], 'email', 'on' => 'view'],
            /* Правила валидации для Manage и Default */
            [['username', 'email', 'role'], 'required', 'on' => ['add', 'default']],
            [['password'], 'required', 'on' => ['add']],
            [['avatar'], 'required', 'on' => ['add']],
            [['username', 'email', 'password', 'newPassword', 'access_token', 'currentPassword'], 'string', 'max' => '255', 'on' => ['add', 'default', 'profile']],
            [['password', 'newPassword'], 'string', 'min' => 8, 'on' => ['add', 'default', 'profile'], 'message' => Yii::t('model', 'Password-Min-8')],
            [['password', 'newPassword'], 'match', 'pattern' => '/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,}).*$/', 'on' => ['add', 'default', 'profile'], 'message' => Yii::t('model', 'Password-Complexity')],
            [['role', 'active', 'expire_at'], 'integer', 'on' => ['add', 'default']],
            [['email'], 'email', 'on' => ['add', 'default', 'profile']],
            [['username', 'email'], 'unique', 'on' => ['add', 'default', 'profile']],

            /* Правила для профиля */
            [['currentPassword'], 'required', 'when' => function ($model) {
                return !empty($model->newPassword);
            }, 'whenClient' => "function (attribute, value) {
                return $('#users-newpassword').val() != '';
            }", 'on' => 'profile'],
            ['currentPassword', 'validateCurrentPassword', 'on' => 'profile'],
            [['password', 'newPassword'], 'validateNotOldPassword', 'on' => ['add', 'default', 'profile']],
        ];
    }

    public function validateNotOldPassword($attribute, $params)
    {
        if (!$this->hasErrors() && !empty($this->$attribute)) {
            if (!$this->isNewRecord) {
                $user = UserIdentity::findIdentity($this->id);
                if ($user && $user->validatePassword($this->$attribute)) {
                    $this->addError($attribute, Yii::t('model', 'Password-Same-As-Old'));
                }
            }
        }
    }

    public function validateCurrentPassword($attribute, $params)
    {
        if (!$this->hasErrors() && !empty($this->newPassword)) {
            $user = UserIdentity::findIdentity($this->id);
            if (!$user || !$user->validatePassword($this->$attribute)) {
                $this->addError($attribute, Yii::t('model', 'Current-Password-Incorrect'));
            }
        }
    }

    public function attributeLabels()
    {
        return [
            'id' => Yii::t('model', 'ID'),
            'role' => Yii::t('model', 'Role'),
            'username' => Yii::t('model', 'Username'),
            'email' => Yii::t('model', 'Email'),
            'password' => Yii::t('model', 'Password'),
            'currentPassword' => Yii::t('model', 'Password-Current'),
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