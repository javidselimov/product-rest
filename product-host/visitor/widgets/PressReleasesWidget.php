<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\widgets;

use Yii;
use yii\base\Widget;
use yii\helpers\Html;
use yii\helpers\Url;
use common\helpers\DateHelper;
use common\models\PressReleases;

class PressReleasesWidget extends Widget
{

    protected $pressReleasesModel;

    private function loadData()
    {
        return PressReleases::getDb()->cache(function ($db) {
            return PressReleases::find()
                ->with('pressReleasesAssets')
                ->where(['active' => '1', 'type' => '1'])
                ->andWhere(['<=', 'date', date('Y-m-d')])
                ->orderBy(['date' => SORT_DESC, 'id' => SORT_DESC])
                ->limit(6)
                ->all();
        }, Yii::$app->params['dbCacheTimeout']);
    }

    public function init()
    {
        $this->pressReleasesModel = $this->loadData();
    }

    public function run()
    {
        // For tabs functionality, wrap content in tabs_content active div
        echo Html::beginTag('div', ['class' => 'tabs_content active']);

        echo Html::beginTag('div', ['class' => 'horizontal-news-container']);

        // Display all 6 press releases
        foreach ($this->pressReleasesModel as $pressRelease) {
            $imageUrl = '';

            // Get the first image if available
            if (!empty($pressRelease->pressReleasesAssets)) {
                $asset = $pressRelease->pressReleasesAssets[0];
                $imageUrl = Yii::$app->params['uploadsUrl'] . '/press-releases/' . $asset->filename_az;
            }

            $title = $pressRelease->{'title_' . Yii::$app->language};
            $content = strip_tags($pressRelease->{'content_' . Yii::$app->language});
            $shortContent = mb_substr($content, 0, 100) . (mb_strlen($content) > 100 ? '...' : '');
            $date = DateHelper::showDate($pressRelease->date);
            $detailUrl = Url::to(['press-releases/detail', 'id' => $pressRelease->id, 'slug' => $pressRelease->slug]);

            echo Html::beginTag('div', ['class' => 'horizontal-news-item']);

            // Image
            echo Html::beginTag('div', ['class' => 'news-image']);
            if (!empty($imageUrl)) {
                echo Html::img($imageUrl, ['alt' => $title]);
            }
            echo Html::endTag('div');

            // Title
            echo Html::beginTag('div', ['class' => 'news-title']);
            echo Html::tag('h3', $title);
            echo Html::endTag('div');

            // Description
//            echo Html::beginTag('div', ['class' => 'news-description']);
//            echo Html::tag('p', $shortContent);
//            echo Html::endTag('div');
//
            // Date
            echo Html::beginTag('div', ['class' => 'news-date']);
            echo Html::tag('span', $date);
            echo Html::endTag('div');

            // Button
            echo Html::beginTag('div', ['class' => 'news-button']);
            echo Html::a(Yii::t('app', 'Read-More'), $detailUrl, ['class' => 'blue_btn']);
            echo Html::endTag('div');

            echo Html::endTag('div');
        }

        echo Html::endTag('div');

        // Add "Full List" button similar to GalleryWidget
        echo Html::beginTag('div', ['class' => 'blue_btn_container']);
        echo Html::a(Yii::t('app', 'Full-List-Button'), Url::to(['press-releases/index', 'type' => '1']), ['class' => 'blue_btn']);
        echo Html::endTag('div');

        echo Html::endTag('div');
    }

}
