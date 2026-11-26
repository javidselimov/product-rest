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
use common\models\Videos;
use visitor\helpers\HtmlHelper;

class VideoWidget extends Widget
{

    protected $videosModel;
    protected $coverImage;
    protected $date;

    private function getLastVideo()
    {
        return Videos::getDb()->cache(function ($db) {
            return Videos::find()->where(['active' => '1'])->andWhere(['<=', 'date', date('Y-m-d')])->orderBy(['date' => SORT_DESC, 'position' => SORT_DESC])->limit(6)->all();
        }, Yii::$app->params['dbCacheTimeout']);
    }

    public function init()
    {
        $this->videosModel = $this->getLastVideo();
    }

    public function run()
    {
        echo Html::beginTag('div', ['class' => 'tabs_content']);

        echo Html::beginTag('div', ['class' => 'horizontal-news-container videogallery']);

        // Display all 6 video items
        foreach ($this->videosModel as $video) {
            $coverImage = HtmlHelper::getYouTubeThumbnail($video['url']);
            $date = DateHelper::showDate($video['date'], 'dd.MM.YYYY');

            echo Html::beginTag('div', [
                'class' => 'horizontal-news-item gallery-item',
                'data-src' => $video['url'],
                'data-sub-html' => $video['title_' . Yii::$app->language],
            ]);

            // Video thumbnail with play button
            echo Html::beginTag('div', ['class' => 'news-image']);
            echo Html::beginTag('div', ['class' => 'image', 'style' => 'background-image: url(' . $coverImage . ')']);
            echo Html::img('/images/play-button.png', ['class' => 'play-button']);
            echo Html::endTag('div');
            echo Html::endTag('div');

            // Title
            echo Html::beginTag('div', ['class' => 'news-title']);
            echo Html::tag('h3', $video['title_' . Yii::$app->language]);
            echo Html::endTag('div');

            // Date
            echo Html::beginTag('div', ['class' => 'news-date']);
            echo Html::tag('span', $date);
            echo Html::endTag('div');

            echo Html::endTag('div');
        }

        echo Html::endTag('div');

        echo Html::beginTag('div', ['class' => 'blue_btn_container']);
        echo Html::a(Yii::t('app', 'Videos-List-Button'), Url::to(['/videos']), ['class' => 'blue_btn']);
        echo Html::endTag('div');

        echo Html::endTag('div');
    }

}
