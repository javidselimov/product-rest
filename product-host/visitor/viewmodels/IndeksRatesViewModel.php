<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\viewmodels;

use common\models\Azir;
use visitor\helpers\HtmlHelper;
use visitor\models\AzirForm1D;

class IndeksRatesViewModel
{
    public $azirModel;
    public $formModel;

    public function __construct(Azir $azirModel, AzirForm1D $azirForm1D)
    {
        $this->azirModel = $azirModel;
        $this->formModel = $azirForm1D;
    }

    public function get1DAZIRAll(int $isChart = 0)
    {
        return $this->azirModel::find()
            ->where(['like', 'title_az', '1D AZIR%', false])
            ->andWhere(['>', 'faiz_az', 0])
            ->andWhere(['>=', 'date', date('Y-m-d', strtotime('-60 days'))])
            ->orderBy(['id' => ($isChart == 1 ? SORT_ASC : SORT_DESC)])
            ->all();
    }


    public function get1DAZIRByDate(string $dateFrom, string $dateTo)
    {
        $dateFrom = HtmlHelper::changeStringDateFormat($dateFrom);
        $dateTo = HtmlHelper::changeStringDateFormat($dateTo);

        return $this->azirModel::find()
            ->where(['like', 'title_az', '1D AZIR%', false])
            ->andWhere(['>', 'faiz_az', 0])
            ->andwhere(['between', 'date', $dateFrom, $dateTo])
            ->orderBy(['id' => SORT_DESC])->all();
    }


    public function getAZIRAll(string $title_name, int $isChart = 0)
    {
        $query = $this->azirModel::find()
            ->where(['like', 'title_az', $title_name, false]);

        $query->andWhere(['>', 'faiz_az', 0])
            ->andWhere(['>=', 'date', date('Y-m-d', strtotime('-60 days'))])
            ->orderBy(['date' => ($isChart == 1 ? SORT_ASC : SORT_DESC)]);

        return $query->all();
    }


    public function getAZIRByDate(string $dateFrom, string $dateTo, string $title_name)
    {
        $dateFrom = HtmlHelper::changeStringDateFormat($dateFrom);
        $dateTo = HtmlHelper::changeStringDateFormat($dateTo);

        return $this->azirModel::find()
            ->where(['', 'title_az', $title_name, false])
            ->andWhere(['>', 'faiz_az', 0])
            ->andwhere(['between', 'date', $dateFrom, $dateTo])
            ->orderBy(['date' => SORT_DESC])->all();
    }


}

