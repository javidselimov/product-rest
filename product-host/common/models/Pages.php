<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use Yii;
use himiklab\yii2\search\behaviors\SearchBehavior;
use yii\helpers\Url;
use yii\helpers\Html;

class Pages extends MainModel
{

    public static function tableName()
    {
        return 'pages';
    }

    public function behaviors()
    {
        return [
            'search' => [
                'class' => SearchBehavior::className(),
                'searchScope' => function ($model) {
                    /** @var \yii\db\ActiveQuery $model */
                    $model->select(['id', 'title_az', 'title_en', 'content_az', 'content_en', 'url', 'slug']);
                    $model->andWhere(['active' => '1', 'visible' => '1']);
                },
                'searchFields' => function ($model) {
                    /** @var self $model */
                    return [
                        ['name' => 'pageID', 'value' => $model->id, 'type' => SearchBehavior::FIELD_UNINDEXED],
                        ['name' => 'title_az', 'value' => $model->title_az, 'type' => SearchBehavior::FIELD_TEXT],
                        ['name' => 'title_en', 'value' => $model->title_en, 'type' => SearchBehavior::FIELD_TEXT],
                        ['name' => 'content_az', 'value' => strip_tags($model->content_az), 'type' => SearchBehavior::FIELD_TEXT],
                        ['name' => 'content_en', 'value' => strip_tags($model->content_en), 'type' => SearchBehavior::FIELD_TEXT],
                        ['name' => 'url', 'value' => $model->url, 'type' => SearchBehavior::FIELD_UNINDEXED],
                        ['name' => 'slug', 'value' => $model->slug, 'type' => SearchBehavior::FIELD_UNINDEXED],
                        /* Указываем для уточнения модели */
                        ['name' => 'model', 'value' => 'pages', 'type' => SearchBehavior::FIELD_UNINDEXED],
                    ];
                },
            ],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'parent_id' => 'Parent ID',
            'title_az' => Yii::t('model', 'Name-Az'),
            'title_en' => Yii::t('model', 'Name-En'),
            'content_az' => Yii::t('model', 'Description-Az'),
            'content_en' => Yii::t('model', 'Description-En'),
            'url' => Yii::t('model', 'URL'),
            'active' => Yii::t('kvtree', 'Active'),
            'selected' => Yii::t('kvtree', 'Selected'),
            'disabled' => Yii::t('kvtree', 'Disabled'),
            'readonly' => Yii::t('kvtree', 'Read Only'),
            'visible' => Yii::t('kvtree', 'Visible'),
            'collapsed' => Yii::t('kvtree', 'Collapsed'),
            'movable_u' => Yii::t('kvtree', 'Movable Up'),
            'movable_d' => Yii::t('kvtree', 'Movable Down'),
            'movable_l' => Yii::t('kvtree', 'Movable Left'),
            'movable_r' => Yii::t('kvtree', 'Movable Right'),
            'removable' => Yii::t('kvtree', 'Removable'),
            'removable_all' => Yii::t('kvtree', 'Removable (with children)'),
        ];
    }

    public function getPagesAssets()
    {
        return $this->hasMany(PagesAssets::className(), ['page_id' => 'id'])->orderBy(['position' => SORT_ASC])->asArray();
    }

    public static function getTreeByParentID(int $parentID, int $pageID = 1)
    {
        return self::getDb()->cache(function ($db) use ($parentID, $pageID) {
            $query = self::find();
            $query->where(['parent_id' => $parentID])->andWhere(['!=', 'id', $parentID])->andWhere(['>', 'id', $pageID])->andWhere(['visible' => 1]);
            if (Yii::$app->language == 'az') {
                $query->andWhere(['show_az' => 1]);
            } else {
                $query->andWhere(['show_en' => 1]);
            }
            $query->addOrderBy('parent_id, left_position');
            return $query->all();
        }, Yii::$app->params['dbCacheTimeout']);
    }

    public static function getFooterMenu(int $parentID, int $pageID = 1)
    {
        return self::getDb()->cache(function ($db) use ($parentID, $pageID) {
            $query = self::find();
            $query->where(['parent_id' => $parentID])->andWhere(['!=', 'id', $parentID])->andWhere(['>', 'id', $pageID])->andWhere(['visible' => 1, 'show_footer' => 1, 'depth' => [1, 2]]);
            if (Yii::$app->language == 'az') {
                $query->andWhere(['show_az' => 1]);
            } else {
                $query->andWhere(['show_en' => 1]);
            }
            $query->addOrderBy('parent_id, left_position');
            return $query->all();
        }, Yii::$app->params['dbCacheTimeout']);
    }

    public static function getRootPages()
    {
        return self::getDb()->cache(function ($db) {
            $query = self::find();
            $query->where(['depth' => 1])->andWhere(['visible' => 1]);
            if (Yii::$app->language == 'az') {
                $query->andWhere(['show_az' => 1]);
            } else {
                $query->andWhere(['show_en' => 1]);
            }
            $query->addOrderBy('parent_id, left_position');
            return $query->all();
        }, Yii::$app->params['dbCacheTimeout']);
    }

    public static function getPageByID(int $id)
    {
        $query = self::find();
        $query->where(['id' => $id, 'active' => 1]);
        if (Yii::$app->language == 'az') {
            $query->andWhere(['show_az' => 1]);
        } else {
            $query->andWhere(['show_en' => 1]);
        }
        $query->orWhere(['id' => $id, 'readonly' => 1]);
        return $query->one();
    }

    public static function getPageLinkByID(int $id, array $options = [])
    {
        $page = self::getPageByID($id);
        if ($page) {
            $lang = Yii::$app->language;
            $title = $page['title_' . $lang] ?: $page['title_az'];
            $url = $page->url ? Url::to($page->url) : Url::to(['/pages/index', 'id' => $page->id, 'slug' => $page->slug]);
            return Html::a($title, $url, $options);
        }
        return null;
    }

    /**
     * @param int $id
     * @return array|null [ 'title' => '...', 'url' => '...' ]
     */
    public static function getPageDataByID(int $id)
    {
        $page = self::getPageByID($id);
        if ($page) {
            $lang = Yii::$app->language;
            return [
                'title' => $page['title_' . $lang] ?: $page['title_az'],
                'url' => $page->url ? Url::to($page->url) : Url::to(['/pages/index', 'id' => $page->id, 'slug' => $page->slug])
            ];
        }
        return null;
    }
}