<?

namespace visitor\widgets\menu;

use common\models\Pages;
use Yii;
use yii\helpers\Html;
use yii\helpers\Url;

class CombinedMenuWidget extends MenuWidget
{
    public function init()
    {
        // Основная модель будет для верхнего меню
        $this->model = Pages::getTreeByParentID(self::TOP_MENU_ID);
        $this->ulOptions = [
            'true' => ['class' => 'menu'],
            'false' => ['class' => 'submenu'],
        ];
    }

    public function run()
    {
        echo Html::beginTag('ul', $this->ulOptions['true']);

        // 1. Добавляем "Left menu" как первый элемент
        echo Html::beginTag('li');
        $hamburger = Html::tag('div', 
            Html::tag('span', '', ['class' => 'line-1']) . 
            Html::tag('span', '', ['class' => 'line-2']) . 
            Html::tag('span', '', ['class' => 'line-3']),
            ['class' => 'hamburger-icon', 'style' => '']
        );
        echo Html::a($hamburger, '#', [
            'title' => Yii::$app->language == 'az' ? '' : '',
            'class' => 'hamburger-link'
        ]);
        
        // Рендерим левое меню как выпадающий список
        $leftMenuModel = Pages::getTreeByParentID(self::LEFT_MENU_ID);
        $this->renderTree($leftMenuModel, 1);
        
        echo Html::endTag('li');

        // 2. Добавляем остальные элементы верхнего меню
        // Передаем depth так, чтобы элементы первого уровня отрисовались как <li> без обертки в <ul>
        $this->renderTopMenuContinuation($this->model);

        echo Html::endTag('ul');
    }

    /**
     * Рендерит продолжение верхнего меню
     */
    protected function renderTopMenuContinuation($model)
    {
        $level = 1;
        foreach ($model as $n => $page) {
            if ($page->depth == 1 and $this->singleMode == true) break;

            if ($page->depth == $level) {
                if ($n > 0) echo Html::endTag('li');
            } elseif ($page->depth > $level) {
                echo Html::beginTag('ul', $this->ulOptions['false']);
            } else {
                echo Html::endTag('li');
                for ($i = $level - $page->depth; $i; $i--) {
                    echo Html::endTag('ul');
                    echo Html::endTag('li');
                }
            }
            echo Html::beginTag('li');
            echo Html::a($page['title_' . Yii::$app->language], $page->url ? Url::to($page->url) : Url::to(['/pages/index', 'id' => $page->id, 'slug' => $page->slug]));
            $level = $page->depth;
        }
        for ($i = $level - 1; $i > 0; $i--) {
            echo Html::endTag('li');
            echo Html::endTag('ul');
        }
        if (count($model) > 0) {
            echo Html::endTag('li');
        }
    }

    /**
     * Вспомогательный метод для рендеринга дерева (адаптированный run из MenuWidget)
     */
    protected function renderTree($model, $startLevel)
    {
        $level = $startLevel;
        foreach ($model as $n => $page) {
            if ($page->depth == 1 and $this->singleMode == true) break;

            if ($page->depth && ($page->depth + $startLevel) == $level) {
                echo Html::endTag('li');
            } elseif (($page->depth + $startLevel) > $level) {
                if ($this->clearMode == true) {
                    echo Html::beginTag('ul');
                } else {
                    echo Html::beginTag('ul', $this->ulOptions['false']);
                }
            } else {
                if ($page->depth) {
                    echo Html::endTag('li');
                }
                for ($i = $level - ($page->depth + $startLevel); $i; $i--) {
                    echo Html::endTag('ul');
                    echo Html::endTag('li');
                }
            }
            echo Html::beginTag('li');
            echo Html::a($page['title_' . Yii::$app->language], $page->url ? Url::to($page->url) : Url::to(['/pages/index', 'id' => $page->id, 'slug' => $page->slug]));
            $level = $page->depth + $startLevel;
        }
        for ($i = $level - $startLevel; $i > 0; $i--) {
            echo Html::endTag('li');
            echo Html::endTag('ul');
        }
    }
}
