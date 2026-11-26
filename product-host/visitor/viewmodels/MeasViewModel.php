<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\viewmodels;

use common\models\Meas;
use common\models\MeasEmitent;
use common\models\MeasInfoType;
use visitor\helpers\HtmlHelper;
use visitor\models\MeasForm;

class MeasViewModel
{

    public $measModel;
    public $measEmitentModel;
    public $measInfoTypeModel;
    public $formModel;

    public $measTable;

    public function __construct(Meas $measModel, MeasEmitent $measEmitent, MeasInfoType $measInfoType, MeasForm $measForm)
    {
        $this->measModel = $measModel;
        $this->measEmitentModel = $measEmitent;
        $this->measInfoTypeModel = $measInfoType;
        $this->formModel = $measForm;
    }

    public function getMeasData(MeasForm $formModel)
    {
        $query = $this->measModel::find()->with(['emitent', 'infoType'])->where(['active' => 1]);
        $query->andFilterWhere(['emitent_id' => $formModel->emitent]);
        $query->andFilterWhere(['info_type_id' => $formModel->infoType]);
        $query->andFilterWhere(['between', 'reg_date', HtmlHelper::changeStringDateFormat($formModel->dateFrom), HtmlHelper::changeStringDateFormat($formModel->dateTo)]);
        $query->andFilterWhere(['dqn' => $formModel->dqn]);
        $query->andFilterWhere(['doc_type_id' => $formModel->docType]);
        $query->addOrderBy(['reg_date' => SORT_DESC, 'id' => SORT_DESC]);
        return $query;
    }
}