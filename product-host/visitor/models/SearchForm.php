<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\models;

use Yii;
use yii\base\Model;
use yii\helpers\Html;
use yii\helpers\HtmlPurifier;

class SearchForm extends Model
{
    const PAGE_SIZE = 4;
    const PAGINATION_BUTTON_COUND = 7;

    public $query;
    public $type;

    /* @var $searchType \himiklab\yii2\search\Search */
    public $searchType;
    public $url;
    public $allowedTypes = ['pages', 'press-releases'];


    /* Кастомные методы */
    public function checkType()
    {
        if (!in_array($this->type, $this->allowedTypes)) {
            $this->addError('type', 'Only pages and press-releases allow!');
        }
    }

    public function initSettings(string $type)
    {
        $allowedTypes = $this->allowedTypes;
        if (in_array($type, $allowedTypes)) {
            if ($type == $allowedTypes[0]) {
                $this->searchType = Yii::$app->siteSearch;
                $this->url = '/pages/index';
            } elseif ($type == $allowedTypes[1]) {
                $this->searchType = Yii::$app->newsSearch;
                $this->url = '/press-releases/detail';
            }
        }
    }
    /* Конец */


    /* Методы для валидации и работы с моделью */
    public function formName()
    {
        return '';
    }

    public function rules()
    {
        return [
            [['type'], 'required'],
            ['query', 'string', 'max' => '40'],
            ['type', 'checkType'],
            //Очищаем тексты
            [['query'], function ($attribute) {
                $this->$attribute = htmlspecialchars(HtmlPurifier::process($this->$attribute), ENT_QUOTES, 'utf-8');
            }],
        ];
    }

    public function attributeLabels()
    {
        return [
            'query' => Yii::t('model', 'Search-Query'),
            'type' => 'Type',
        ];
    }
    /* Конец */

}