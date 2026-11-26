<?

/* @var $this \yii\web\View
 * @var $formModel visitor\models\MeasForm
 * @var $model common\models\Meas
 */

use yii\helpers\ArrayHelper;
?>
<div class="meas-table pjax-content">
    <div class="table_title">
        <p><? echo $model->emitent['name_' . Yii::$app->language] ?></p>
        <a target="_blank" href="<? echo Yii::$app->params['uploadsUrl'] . '/meas/' . $model->file_path ?>" download="download" class="pdf-btn hint--right hint--bounce" aria-label="Yüklə"></a>
    </div>
    <table class="references">
        <thead>
        <tr>
            <th><? echo Yii::t('model', 'Info-Type-ID') ?></th>
            <th><? echo Yii::t('model', 'Doc-Type-ID') ?></th>
            <th><? echo Yii::t('model', 'Registration-Date') ?></th>
            <th><? echo Yii::t('model', 'DQN') ?></th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td class="fix-col"><? echo $model->infoType['name_' . Yii::$app->language] ?></td>
            <td><? echo ArrayHelper::getValue(Yii::t('model', 'MEAS-Document-Types'), $model->doc_type_id); ?></td>
            <td><? echo $model->reg_date ?></td>
            <td><? echo $model->dqn ?></td>
        </tr>
        </tbody>
    </table>
</div>