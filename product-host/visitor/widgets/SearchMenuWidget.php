<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\widgets;

use Yii;
use common\models\Pages;
use visitor\widgets\menu\MenuWidget;

class SearchMenuWidget extends MenuWidget
{

    public function init()
    {
        $this->model = Pages::getRootPages();
    }

    public function run()
    {
        foreach ($this->model as $model) {
            echo '<option value="' . $model['id'] . '">' . $model['title_' . Yii::$app->language] . '</option>';
        }
    }

}