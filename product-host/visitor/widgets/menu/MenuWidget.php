<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\widgets\menu;

use Yii;
use yii\base\Widget;
use yii\helpers\Url;
use yii\helpers\Html;

class MenuWidget extends Widget
{

    const TOP_MENU_ID = 1;
    const LEFT_MENU_ID = 2;

    public $pageID;

    protected $model;
    protected $singleMode = false;
    protected $clearMode = false;
    protected $headerTitle = false;
    protected $ulOptions = [];

    public function run()
    {
        $level = 0;
        $this->setheaderTitle();
        foreach ($this->model as $n => $page) {

            if ($page->depth == 1 and $this->singleMode == true) break;

            if ($page->depth && $page->depth == $level) {
                echo Html::endTag('li');
            } elseif ($page->depth > $level) {
                if ($this->clearMode == true) {
                    echo Html::beginTag('ul');
                } else {
                    echo Html::beginTag('ul', $level == 0 ? $this->ulOptions['true'] : $this->ulOptions['false']);
                }
            } else {
                if ($page->depth) {
                    echo Html::endTag('li');
                }
                for ($i = $level - $page->depth; $i; $i--) {
                    echo Html::endTag('ul');
                    echo Html::endTag('li');
                }
            }
            echo Html::beginTag('li');
            echo Html::a($page['title_' . Yii::$app->language], $page->url ? Url::to($page->url) : Url::to(['/pages/index', 'id' => $page->id, 'slug' => $page->slug]));
            $level = $page->depth;
        }
        for ($i = $level; $i; $i--) {
            echo Html::endTag('li');
            echo Html::endTag('ul');
        }
    }

    private function setheaderTitle()
    {
        if ($this->headerTitle == true) {
            echo Html::tag('div', $this->headerTitle, ['class' => 'content_title']);
        }
    }
}