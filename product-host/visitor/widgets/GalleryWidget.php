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
use common\models\Gallery;

class GalleryWidget extends Widget
{

    protected $galleryModel;
    protected $coverImage;
    protected $date;

    private function getLastGallery()
    {
        return Gallery::getDb()->cache(function ($db) {
            return Gallery::find()->where(['active' => '1'])->andWhere(['<=', 'date', date('Y-m-d')])->with(['coverImage'])->orderBy(['date' => SORT_DESC, 'id' => SORT_DESC])->limit(6)->all();
        }, Yii::$app->params['dbCacheTimeout']);
    }

    public function init()
    {
        $this->galleryModel = $this->getLastGallery();
    }

    public function run()
    {
        echo Html::beginTag('div', ['class' => 'tabs_content']);

        echo Html::beginTag('div', ['class' => 'horizontal-news-container']);

        // Display all 6 gallery items
        foreach ($this->galleryModel as $gallery) {
            $coverImage = Yii::$app->params['uploadsUrl'] . '/photo-gallery/' . $gallery->coverImage['filename'];
            $date = DateHelper::showDate($gallery['date'], 'dd.MM.YYYY');
            $detailUrl = Url::to(['/gallery/photos/detail', 'id' => $gallery['id']]);

            echo Html::beginTag('div', ['class' => 'horizontal-news-item']);

            // Image
            echo Html::beginTag('div', ['class' => 'news-image']);
            echo Html::img($coverImage, ['alt' => $gallery['title_' . Yii::$app->language]]);
            echo Html::endTag('div');

            // Title
            echo Html::beginTag('div', ['class' => 'news-title']);
            echo Html::tag('h3', $gallery['title_' . Yii::$app->language]);
            echo Html::endTag('div');

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

        echo Html::beginTag('div', ['class' => 'blue_btn_container']);
        echo Html::a(Yii::t('app', 'Photos-List-Button'), Url::to(['/gallery/photos']), ['class' => 'blue_btn']);
        echo Html::endTag('div');

        echo Html::endTag('div');
    }

}
