<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\models;

use yii;
use yii\base\Model;
use yii\web\Cookie;
use yii\helpers\HtmlPurifier;

class FeedbackForm extends Model
{
    public $responseMessage = null;

    public $name;
    public $email;
    public $subject;
    public $message;
    public $ip;

    public function rules()
    {
        return [
            [['name', 'email', 'subject', 'message'], 'required'],
            [['email'], 'email'],
            [['ip'], 'default', 'value' => Yii::$app->getRequest()->getUserIP()],
            //Проверем на куки
            ['cookie', 'checkCookie', 'skipOnEmpty' => false, 'skipOnError' => false],
            //Очищаем тексты
            [['message'], function ($attribute) {
                $this->$attribute = HtmlPurifier::process($this->$attribute);
            }],
        ];
    }

    public function attributeLabels()
    {
        return [
            'name' => 'Adınız',
            'email' => 'E-mail',
            'subject' => 'Mövzu',
            'message' => 'Mətn',
        ];
    }

    public function afterValidate()
    {
        if (!$this->hasErrors()) {
            $this->sendEmail();
            $this->setCookie();
        }
        parent::afterValidate();
    }

    private function setCookie()
    {
        $cookie = new Cookie([
            'name' => 'Success',
            'value' => 'Feedback',
            'expire' => time() + 86400,
        ]);
        return Yii::$app->getResponse()->getCookies()->add($cookie);
    }

    private function sendEmail()
    {
        return Yii::$app->mailer->compose()
            ->setFrom($this->email)
            ->setTo('mail@cbar.az')
            ->setCc('urmuz.tagizade@gmail.com')
            ->setSubject($this->subject . ' / ' . $this->name)
            ->setTextBody($this->message)
            ->send();
    }

    public function checkCookie($attribute)
    {
        if (Yii::$app->getRequest()->getCookies()->getValue('Success') == 'Feedback') {
            $this->addError($attribute, '24 saat ərzində yalnız bir müraciət göndərmək olar!');
        }
    }

}
