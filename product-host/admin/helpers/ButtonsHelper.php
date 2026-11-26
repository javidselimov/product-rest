<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\helpers;

use Yii;
use yii\helpers\Html;
use yii\helpers\Url;

class ButtonsHelper
{

    /* Кнопка Exit с плагином SweetAlert */
    public static function exitButton()
    {
        $html = Html::beginTag('a', [
            'id' => 'exit-system-alert',
            'href' => 'javascript:void(0)',
            'data-title' => Yii::t('app', 'Exit-System'),
            'data-text' => Yii::t('app', 'Exit-System-Alert'),
            'data-confirm-text' => Yii::t('app', 'Yes'),
            'data-cancel-text' => Yii::t('app', 'No'),
        ]);
        $html .= Html::tag('i', null, ['class' => 'ti-power-off m-r-5']);
        $html .= Yii::t('app', 'Exit');
        $html .= Html::endTag('a');
        return $html;
    }

    public static function submitButton(int $isNewRecord = null)
    {
        $content = $isNewRecord ? Yii::t('app', 'Edit-Button') : Yii::t('app', 'Add-Button');
        return Html::submitButton($content, ['class' => 'btn btn-inverse btn-lg waves-effect waves-light']);
    }

    /* ReturnButton */
    public static function returnButton($url = false)
    {
        if (empty($url)) $url = Yii::$app->request->referrer;
        return Html::a(Yii::t('app', 'Back-Button'), $url, ['class' => 'btn btn-primary btn-lg waves-effect waves-light', 'data-pjax' => '0']);
    }

    public static function deleteButton(int $id)
    {
        $currentController = Yii::$app->controller->id;
        return Html::a(Yii::t('app', 'Delete-Button'), Url::to([$currentController . '/delete', 'id' => $id]), ['class' => 'btn btn-danger float-right btn-lg waves-effect waves-light', 'data-pjax' => '0']);
    }

}