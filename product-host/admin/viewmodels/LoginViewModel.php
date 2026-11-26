<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\viewmodels;

use Yii;
use yii\base\Model;
use common\components\identity\UserIdentity;

class LoginViewModel extends Model
{

    public $email;
    public $password;
    public $captcha;
    public $rememberMe = true;
    private $_user = false;

    const EXPIRE_TIME = 31622400; //365 дней

    public function rules()
    {
        return [
            [['email', 'password'], 'required'],
            ['rememberMe', 'boolean'],
            ['password', 'validatePassword'],
            ['captcha', 'captcha', 'captchaAction' => 'login/captcha', 'on' => 'withCaptcha'],
        ];
    }

    public function attributeLabels()
    {
        return [
            'email' => Yii::t('model', 'Email'),
            'password' => Yii::t('model', 'Password'),
            'captcha' => Yii::t('model', 'Captcha'),
            'rememberMe' => Yii::t('model', 'Remember'),
        ];
    }

    public function validatePassword($attribute, $params)
    {
        if (!$this->hasErrors()) {
            $user = $this->getUser();
            if (!$user || !$user->validatePassword($this->password)) {
                $this->addError($attribute, Yii::t('app', 'Invalid username or password'));
            }
        }
    }

    public function login()
    {
        $this->_user = $this->getUser();
        if ($this->validate()) {
            if ($this->getUser()) {
                // Используем существующий токен, если он валиден, чтобы не инвалидировать другие сессии
                if (empty($this->_user->access_token) || $this->_user->expire_at < time()) {
                    $this->_user->generateAccessToken();
                    $this->_user->expire_at = time() + static::EXPIRE_TIME;
                    $this->_user->save();
                }

                $duration = $this->rememberMe ? static::EXPIRE_TIME : 0;
                Yii::$app->user->login($this->_user, $duration);
                return $this->_user->access_token;
            }
        }
        return false;
    }

    public function getUser()
    {
        if ($this->_user === false) {
            $this->_user = UserIdentity::findByUsername($this->email);
        }
        return $this->_user;
    }

}