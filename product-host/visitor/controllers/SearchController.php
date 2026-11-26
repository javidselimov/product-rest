<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\controllers;

use Yii;
use yii\data\ArrayDataProvider;
use visitor\models\SearchForm;


class SearchController extends MainController
{

    public $searchModel;

    public function __construct($id, \yii\base\Module $module, array $config = [], SearchForm $searchModel)
    {
        $this->searchModel = $searchModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex(string $type = 'press-releases', string $query = null)
    {
        $model = $this->searchModel;
        $model->initSettings($type);
        if (Yii::$app->request->get()) {
            $model->load(Yii::$app->request->get());
            if (empty($model->query)) {
                return $this->redirect(['/']);
            }
            if ($model->validate()) {
                $searchData = $model->searchType->find($model->query);
                $dataProvider = new ArrayDataProvider([
                    'allModels' => $searchData['results'],
                    'sort' => [
                        'attributes' => ['pageID'],
                        'defaultOrder' => [
                            'pageID' => SORT_DESC
                        ]
                    ],
                    'pagination' => ['pageSize' => $model::PAGE_SIZE],
                ]);
                return $this->render('index', [
                        'model' => $model,
                        'hits' => $dataProvider->getModels(),
                        'pagination' => $dataProvider->getPagination(),
                    ]
                );
            } else {
                return $this->render('error', ['model' => $model]);
            }
        }
    }

}