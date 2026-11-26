<?

namespace visitor\widgets\menu;

use common\models\Pages;
use Yii;
use yii\helpers\Html;
use yii\helpers\Url;

class CombinedMobileMenuWidget extends MenuWidget
{
    public function init()
    {
        $this->model = Pages::getTreeByParentID(self::TOP_MENU_ID);
        $this->clearMode = true;
    }

    public function run()
    {
        echo Html::beginTag('ul');

        // 1. Добавляем остальные элементы верхнего меню
        $this->renderTopMenuContinuation($this->model);

        // 2. Добавляем "Left menu" (Other) после основного меню
        echo Html::beginTag('li');
        echo Html::a(Html::tag('span', 'Open submenu (☰)', ['class' => 'mm-sronly']), '#left-menu-submenu', [
            'class' => 'mm-next',
            'aria-owns' => 'left-menu-submenu',
            'aria-haspopup' => 'true'
        ]);
        
        //$icon = Html::tag('span', '&#9776;', ['style' => 'font-size: 20px; line-height: 1; vertical-align: middle;']);
        $icon = Html::tag('span', Yii::t('app', 'Other'), ['style' => 'font-size: 14px; line-height: 1; vertical-align: middle;']);
        echo Html::a($icon, '#left-menu-submenu', [
            'class' => 'hint--bottom hint--bounce mm-selected',
            'aria-label' => Yii::$app->language == 'az' ? '' : '',
            'aria-owns' => 'left-menu-submenu'
        ]);
        
        // Рендерим левое меню как вложенный список
        $leftMenuModel = Pages::getTreeByParentID(self::LEFT_MENU_ID);
        $this->renderTree($leftMenuModel, 1, 'left-menu-submenu');
        
        echo Html::endTag('li');

        // 3. Добавляем горячую линию
        echo Html::beginTag('li');
        echo Html::a(
            Html::img('/images/phone-receiver.svg') . '966',
            'tel:966',
            [
                'class' => 'header_hotline hint--bottom hint--bounce semi-bold blue',
                'aria-label' => Yii::t('footer', 'Hotline')
            ]
        );
        echo Html::endTag('li');

        // 4. Добавляем переключатель языков
//        echo Html::beginTag('li');
//        $langLabel = Yii::$app->language == 'az' ? 'EN' : 'AZ';
//        $langCode = Yii::$app->language == 'az' ? 'en' : 'az';
//        echo Html::a($langLabel, Url::current(['language' => $langCode]), [
//            'class' => 'semi-bold blue',
//            'style' => 'text-transform: uppercase;'
//        ]);
//        echo Html::endTag('li');

        // 5. Добавляем MEAS как выпадающее меню
        echo Html::beginTag('li');
        echo Html::a(Yii::t('app', 'MEAS'), 'javascript:void(0);', ['class' => 'semi-bold blue']);
        echo Html::beginTag('ul');
        echo Html::tag('li', Html::a(Yii::t('app', 'MEAS Page'), Url::to(['meas/index'])));
        echo Html::tag('li', Html::a(Yii::t('app', 'MEAS About'), '/page-182/about-esid'));
        echo Html::endTag('ul');
        echo Html::endTag('li');

        // 6. Добавляем E-CBAR
        echo Html::beginTag('li', ['class' => 'show-max-568']);
        echo Html::a('E-CBAR', 'https://e-cbar.az/', [
            'target' => '_blank',
            'class' => 'semi-bold blue'
        ]);
        echo Html::endTag('li');

        echo Html::endTag('ul');
    }

    /**
     * Рендерит продолжение меню без создания нового <ul> для первого уровня
     */
    protected function renderTopMenuContinuation($model)
    {
        $level = 1;
        foreach ($model as $n => $page) {
            if ($page->depth == 1 and $this->singleMode == true) break;

            if ($page->depth == $level) {
                if ($n > 0) echo Html::endTag('li');
            } elseif ($page->depth > $level) {
                echo Html::beginTag('ul');
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
     * Вспомогательный метод для рендеринга дерева
     */
    protected function renderTree($model, $startLevel, $id = null)
    {
        $level = $startLevel;
        foreach ($model as $n => $page) {
            if ($page->depth == 1 and $this->singleMode == true) break;

            if ($page->depth && ($page->depth + $startLevel) == $level) {
                echo Html::endTag('li');
            } elseif (($page->depth + $startLevel) > $level) {
                echo Html::beginTag('ul', $id ? ['id' => $id] : []);
                $id = null; // Только для первого уровня вложенности
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
