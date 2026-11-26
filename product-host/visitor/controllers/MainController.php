<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\controllers;

use yii\web\Controller;
use visitor\behaviors\LanguageBehavior;

class MainController extends Controller
{
    public function init()
    {
        $this->layout = "@visitor/views/layouts/main";
        parent::init();
    }

    public function behaviors()
    {
        return [
            'languageBehavior' => [
                'class' => LanguageBehavior::className(),
            ],
        ];
    }

}
