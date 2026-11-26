<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\controllers;

use Yii;
use yii\data\ActiveDataProvider;
use yii\helpers\Url;
use visitor\viewmodels\RssViewModel;

class RssController extends MainController
{

    public $rssViewModel;

    public function __construct($id, \yii\base\Module $module, array $config = [], RssViewModel $rssViewModel)
    {
        $this->rssViewModel = $rssViewModel;
        parent::__construct($id, $module, $config);
    }

    public function init()
    {
        $this->rssViewModel->checkLanguage();
        $this->rssViewModel->checkCount();
        parent::init();
    }

    public function actionReleases(string $language = 'az', int $count = RssViewModel::DEFAULT_COUNT)
    {
        if ($count == 0) $count = RssViewModel::DEFAULT_COUNT;
        $dataProvider = new ActiveDataProvider([
            'query' => $this->rssViewModel->pressReleasesModel::find()
                ->select(['id', 'title_az', 'title_en', 'content_az', 'content_en', 'slug', 'created_at', 'updated_at'])
                ->orderBy(['date' => SORT_DESC]),
            'pagination' => ['pageSize' => $count],
        ]);

        Yii::$app->response->format = \yii\web\Response::FORMAT_RAW;
        Yii::$app->response->headers->add('Content-Type', 'application/rss+xml; charset=utf-8');

        Yii::$app->response->data = \Zelenin\yii\extensions\Rss\RssView::widget([
            'dataProvider' => $dataProvider,
            'channel' => [
                'title' => function ($widget, \Zelenin\Feed $feed) {
                    $feed->addChannelTitle(Yii::t('app', 'Project-Name'));
                },
                'link' => Url::toRoute('press-releases/', true),
                'description' => Yii::t('app', 'Press-Releases'),
                'language' => function ($widget, \Zelenin\Feed $feed) {
                    return Yii::$app->language;
                },
                'ttl' => '40',
            ],
            'items' => [
                'title' => function ($model, $widget, \Zelenin\Feed $feed) use ($language) {
                    return $model->{title_ . $language};
                },
                'description' => function ($model, $widget, \Zelenin\Feed $feed) use ($language) {
                    return $model->{content_ . $language};
                },
                'link' => function ($model, $widget, \Zelenin\Feed $feed) {
                    return Url::toRoute(['press-releases/detail', 'id' => $model->id, 'slug' => $model->slug], true);
                },
                'guid' => function ($model, $widget, \Zelenin\Feed $feed) {
                    return Url::toRoute(['press-releases/detail', 'id' => $model->id, 'slug' => $model->slug], true);
                },
                'pubDate' => function ($model, $widget, \Zelenin\Feed $feed) {
                    $date = \DateTime::createFromFormat('Y-m-d H:i:s', $model->created_at);
                    return $date->format(DATE_RSS);
                },
                'updDate' => function ($model, $widget, \Zelenin\Feed $feed) {
                    $date = \DateTime::createFromFormat('Y-m-d H:i:s', $model->updated_at);
                    return $date->format(DATE_RSS);
                },
            ],
        ]);
    }

}