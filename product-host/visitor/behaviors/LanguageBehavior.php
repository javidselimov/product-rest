<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace visitor\behaviors;

use yii;
use yii\base\Behavior;
use yii\base\Controller;

class LanguageBehavior extends Behavior
{

    private $_allowLanguages = ['az', 'en'];

    public function events()
    {
        return [
            Controller::EVENT_BEFORE_ACTION => 'beforeAction',
        ];
    }

    public function checkLanguage()
    {
        $session = Yii::$app->session;
        $sessionLanguage = $session->get('language');
        if ($sessionLanguage) {
            Yii::$app->language = $sessionLanguage;
        } else {
            Yii::$app->language = $this->_allowLanguages[0];
        }
    }

    public function beforeAction()
    {
        $this->checkLanguage();
        $language = Yii::$app->request->get('language');
        if (in_array($language, $this->_allowLanguages)) {
            $session = Yii::$app->session;
            $session->set('language', $language);
            Yii::$app->language = $language;
        }
    }
}