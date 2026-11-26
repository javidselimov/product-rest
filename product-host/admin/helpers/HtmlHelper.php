<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace admin\helpers;

use Yii;
use yii\helpers\Html;
use common\helpers\HtmlHelper as MainHtmlHelper;

class HtmlHelper extends MainHtmlHelper
{
    /* Функция показа предупреждений */
    public static function showAlert(string $message, string $type)
    {
        $html = Html::beginTag('div', ['class' => 'alert alert-icon alert-' . $type . ' alert-dismissible fade in m-t-20']);
        $html .= Html::beginTag('button', ['class' => 'close', 'type' => 'button', 'data-dismiss' => 'alert', 'aria-label' => 'close']);
        $html .= Html::tag('span', false, ['aria-hidden' => 'true']);
        $html .= Html::endTag('button');
        $html .= Html::tag('i', false, ['class' => 'mdi mdi-check-all']);
        $html .= Html::tag('strong', $message);
        $html .= Html::endTag('div');
        return $html;
    }

    /* Функция показа превью изображений */
    public static function showImagePreview(string $image = null, array $params = [])
    {
        $imagePath = Yii::$app->params['uploadsUrl'] . '/' . $params['folder'] . '/' . $image;
        if (!empty($image)) {
            $html = Html::beginTag('div', ['class' => 'photo-thumb']);
            $html .= Html::a(Html::img($imagePath, ['class' => 'img-circle img-thumbnail thumb-sm']), $imagePath, ['data-lity' => 'true']);
            $html .= Html::endTag('div');
            return $html;
        }
    }

    /* Функция показа статуса записи */
    public static function getRecordStatusButton(int $status, string $url = null)
    {
        $statusList = Yii::t('model', 'Status-List');
        $colorsList = ['danger', 'teal'];
        if ($url == null) $url = '#';
        if (array_key_exists($status, $statusList)) {
            return Html::a($statusList[$status], $url, ['class' => 'btn wd-100 btn-' . $colorsList[$status]]);
        }
    }

}