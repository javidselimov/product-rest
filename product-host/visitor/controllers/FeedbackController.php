<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\controllers;

use Yii;
use yii\helpers\Html;
use visitor\models\FeedbackForm;

class FeedbackController extends MainController
{

    public function actionIndex()
    {
        $model = new FeedbackForm();
        if (Yii::$app->request->post()) {
            $model->load(Yii::$app->request->post());
            if ($model->validate()) {
                $model->responseMessage = Html::tag('div', 'Müraciətiniz göndərildi.', ['class' => 'success-message']);
            } else {
                $error = current($model->errors);
                $model->responseMessage = Html::tag('div', $error[0], ['class' => 'fail-message']);
            }
        }
        return $this->render('index', ['model' => $model]);
    }
}