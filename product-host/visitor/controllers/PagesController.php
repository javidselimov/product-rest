<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\controllers;

use Yii;
use visitor\viewmodels\PagesViewModel;

class PagesController extends MainController
{

    public $pagesViewModel;

    public function __construct($id, \yii\base\Module $module, PagesViewModel $pagesViewModel, array $config = [])
    {
        $this->pagesViewModel = $pagesViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex(int $id)
    {

        $model = $this->pagesViewModel;
        $model->pageID = $id;
        $model->page = $model->pagesModel::getPageByID($id);
        $model->anniversaryHelper->pageID = $id;
        if ($model->page) {
            $model->pagesAssets = $model->page->pagesAssets;
            $model->coverImage = $model->getCoverImage($model->pagesAssets);
            return $this->render('index', ['model' => $model]);
        }
        return $this->redirect(['home/index']);
    }


    public function isMobile($userAgent = null, $httpHeaders = null)
    {
        // ... existing code ...

        if (isset($userAgent) && strpos($userAgent, 'Safari') !== false) {
            // Check for specific conditions related to Safari
            // Modify this part based on your observations
            // You can use additional conditions like checking for 'iPhone' or 'iPad'
            // Example: if (strpos($userAgent, 'iPhone') !== false) { ... }
            return true;
        }

        // ... existing code ...

        return false;
    }


    private function isMobileOrTablet()
    {
        $userAgent = $_SERVER['HTTP_USER_AGENT'];

        // Check for mobile Safari
        if (stripos($userAgent, 'iPhone') !== false || stripos($userAgent, 'iPad') !== false) {
            return 'Safari';
        }

        // Check for other mobile devices
        $mobileKeywords = array('Mobile', 'Android', 'Windows Phone');
        foreach ($mobileKeywords as $keyword) {
            if (stripos($userAgent, $keyword) !== false) {
                return 'Mobile';
            }
        }

        // Check for tablets (including iPad)
        $tabletKeywords = array('Tablet', 'iPad', 'Macintosh', 'iPadOS', 'Mac');
        foreach ($tabletKeywords as $keyword) {
            if (stripos($userAgent, $keyword) !== false) {
                return 'Tablet';
            }
        }

        // Assume it's a desktop browser
        return 'Desktop';
    }


    public function actionStrategy()
    {
        if (Yii::$app->language == 'az') {
            $title = '2024-2026-cı illərdə maliyyə sektorunun inkişaf Strategiyası';
            $content = 'Azərbaycan Respublikası Mərkəzi Bankının İdarə Heyəti tərəfindən "2024-2026-cı illərdə maliyyə sektorunun inkişaf Strategiyası" təsdiq olunmuşdur.';
            $link = '/2024_2026_Azerbaijani.pdf';
        } else {
            $title = 'Financial Sector Development Strategy 2024-2026';
            $content = 'The Management Board of Central Bank of Azerbaijan approved the "Financial Sector Development Strategy 2024-2026"';
            $link = '/2024_2026_English.pdf';
        }

        $deviceType = $this->isMobileOrTablet();
        if ($deviceType == 'Desktop') {
            $pdfButton = '<a class="button pdf-view" data-iframe="true" id="open-pdf" data-src="' . $link . '#toolbar=0&navpanes=0&scrollbar=0">' . $title . '</a>';
        } elseif ($deviceType == 'Mobile' || $deviceType == 'Tablet' || $deviceType == 'Safari') {
            $pdfButton = '<a class="button" href="' . $link . '">' . $title . '</a>';
        }


        return $this->render('strategy', [
            'pdfButton' => $pdfButton,
            'title' => $title,
            'content' => $content
        ]);
    }

    public function actionStats()
    {
        return $this->redirect(['home/index']);
    }

    public function actionStatsMonthly()
    {
        return $this->render('stats-monthly');
    }

    public function actionStatsYearly()
    {
        return $this->render('stats-yearly');
    }

}
