<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\helpers;

use Yii;
use yii\base\Widget;
use yii\helpers\Html;
use visitor\widgets\menu\TempMenuWidget;

class AnniversaryHelper extends Widget
{
    private $allowedPages = [];
    public $pageID;

    public function init()
    {
        $this->allowedPages = $this->getAllowedPages();
        parent::init();
    }

    private function getAllowedPages()
    {
        return $this->allowedPages = [
            '147', '148', '149', '150', '151', '152',
            '155', '156', '158', '159', '160', '162',
            '163', '164'
        ];
    }

    private function checkAllowedPage()
    {
        if (in_array($this->pageID, $this->allowedPages)) {
            return true;
        }
    }

    public function showMenu()
    {
        if ($this->checkAllowedPage()) {
            return TempMenuWidget::widget([
                'pageID' => 146,
                'leftPosition' => 2,
                'customID' => 146
            ]);
        }
    }

    public function showBanner()
    {
        if ($this->checkAllowedPage()) {
            $html = Html::beginTag('div', ['class' => 'banner-in']);
            if (Yii::$app->language === "az") {
                $html .= Html::img('/images/100yearsBannerInner.png');
            } else {
                $html .= Html::img('/images/100yearsBannerInnerEn.png');
            }
            $html .= Html::endTag('div');
        }
        return $html;
    }

    public function getCSSClass()
    {
        if ($this->checkAllowedPage()) {
            return 'content100Years';
        }
    }

}