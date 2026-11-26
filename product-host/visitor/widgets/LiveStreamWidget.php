<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\widgets;

use Yii;
use common\models\VideosStreams;
use yii\base\Widget;

class LiveStreamWidget extends Widget
{

    protected $model;

    private function getLastVideo()
    {
        return VideosStreams::find()->where(['active' => '1'])->orderBy(['id' => SORT_DESC])->limit(1)->one();
    }

    public function init()
    {
        $this->model = $this->getLastVideo();
    }

    public function run()
    {
        $url = $this->model->url;

        if ($url) {
            echo '<div class="toolbar"><a target="_blank" href="'.$url.'" class="btn btn_live">'.Yii::t('app', 'Live stream').'<span class="live-icon"></span></a></div>';

            // Insert the HTML with PHP here
            echo '
        <div class="gallery-grid videogallery gallery-pagination live-stream-popup">
            <div class="gallery-item live-stream-item" data-src="'.$url.'" data-sub-html="'.Yii::t('app', 'Live stream').'">
                '.Yii::t('app', 'Live stream').'
            </div>
        </div>';
        }
    }


}