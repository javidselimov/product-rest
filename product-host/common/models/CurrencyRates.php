<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use Yii;
use common\helpers\DateHelper;
use admin\behaviors\UploadCurrencyBehavior;

class CurrencyRates extends MainModel
{

    public $xlsxFile;

    /* Конвертирование даты в Unix Timestamp */
    private function formatDate()
    {
        if ($this->scenario == 'add') return $this->date = strtotime($this->date);
    }

    public function beforeSave($insert)
    {
        $this->formatDate();
        return parent::beforeSave($insert);
    }

    public function behaviors()
    {
        return array_merge(parent::behaviors(), [
            'uploadFileBehavior' => [
                'class' => UploadCurrencyBehavior::className(),
                'attributes' => ['xlsxFile'],
            ],
        ]);
    }

    public static function tableName()
    {
        return 'currency_rates';
    }

    public function rules()
    {
        return [
            /* Правила валидации для GridView */
            [['date', 'usd', 'eur', 'gbp', 'rub', 'try'], 'integer', 'on' => 'view'],
            /* Правила валидации для Add и Default */
            [['created_at', 'updated_at'], 'safe', 'on' => ['add', 'default']],
            [['usd', 'eur', 'rub', 'gbp', 'aud', 'aed', 'cny', 'dkk', 'hkd', 'irr', 'sek', 'chf', 'ils', 'cad', 'kwd', 'lbp', 'egp', 'nok', 'pln', 'sgd', 'try', 'jpy', 'byn', 'eek', 'gel', 'kzt', 'kgs', 'lvl', 'ltl', 'mdl', 'uzs', 'tjs', 'tmt', 'uah', 'sdr', 'xau', 'xag', 'xpt', 'xpd', 'ars', 'brl', 'inr', 'idr', 'mxn', 'sar', 'zar', 'krw', 'nzd', 'czk', 'clp', 'myr', 'twd', 'vnd', 'bgn','ron','iqd','thb','dzd','mad','huf','pkr','ngn','qar','rsd'], 'string', 'on' => ['add', 'default']],
            [['date'], 'required', 'on' => ['add', 'default']],
            [['active'], 'integer', 'on' => ['add', 'default']],
            ['xlsxFile', 'required', 'on' => ['add']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'date' => Yii::t('model', 'Created-Date'),
            'xlsxFile' => Yii::t('model', 'Choose-File'),
            'created_at' => Yii::t('model', 'Created-Date'),
            'updated_at' => Yii::t('model', 'Updated-Date'),
            'active' => Yii::t('model', 'Status'),
            'usd' => 'USD',
            'eur' => 'EUR',
            'rub' => 'RUB',
            'gbp' => 'GBP',
            'aud' => 'AUD',
            'aed' => 'AED',
            'cny' => 'CNY',
            'dkk' => 'DKK',
            'hkd' => 'HKD',
            'irr' => 'IRR',
            'sek' => 'SEK',
            'chf' => 'CHF',
            'ils' => 'ILS',
            'cad' => 'CAD',
            'kwd' => 'KWD',
            'lbp' => 'LBP',
            'egp' => 'EGP',
            'nok' => 'NOK',
            'pln' => 'PLN',
            'sgd' => 'SGD',
            'try' => 'TRY',
            'jpy' => 'JPY',
            'byn' => 'BYN',
            'eek' => 'EEK',
            'gel' => 'GEL',
            'kzt' => 'KZT',
            'kgs' => 'KGS',
            'lvl' => 'LVL',
            'ltl' => 'LTL',
            'mdl' => 'MDL',
            'uzs' => 'UZS',
            'tjs' => 'TJS',
            'tmt' => 'TMT',
            'uah' => 'UAH',
            'sdr' => 'SDR',
            'xau' => 'XAU',
            'xag' => 'XAG',
            'xpt' => 'XPT',
            'xpd' => 'XPD',
            'ars' => 'ARS',
            'brl' => 'BRL',
            'inr' => 'INR',
            'idr' => 'IDR',
            'mxn' => 'MXN',
            'sar' => 'SAR',
            'zar' => 'ZAR',
            'krw' => 'KRW',
            'nzd' => 'NZD',
            'czk' => 'CZK',
            'clp' => 'CLP',
            'myr' => 'MYR',
            'twd' => 'TWD',
            'vnd' => 'VND',
            'bgn' => 'BGN',
            'ron' => 'RON',
            'iqd' => 'IQD',
            'thb' => 'THB',
            'dzd' => 'DZD',
            'mad' => 'MAD',
            'huf' => 'HUF',
            'pkr' => 'PKR',
            'ngn' => 'NGN',
            'qar' => 'QAR',
            'rsd' => 'RSD',
        ];
    }

    /** @return self */
    public static function getLastCurrency(array $fields = [])
    {
        return self::getDb()->cache(function ($db) use ($fields) {
            return self::find()->select($fields)->where(['active' => '1'])->orderBy(['id' => SORT_DESC])->one();
        }, Yii::$app->params['dbCacheTimeout']);
    }

    /** @return self */
    public static function getPreviousCurrency(array $fields = [])
    {
        return self::getDb()->cache(function ($db) use ($fields) {
            return self::find()->select($fields)->where(['active' => '1'])->orderBy(['id' => SORT_DESC])->offset(1)->one();
        }, Yii::$app->params['dbCacheTimeout']);
    }

    /** @return self */
    public static function getCurrencyByDate(string $date, string $format = DateHelper::DEFAULT_FORMAT)
    {
        $date = DateHelper::dateToTimeStamp($date, $format);
        return self::find()->where(['<=', 'date', $date])->andWhere(['active' => '1'])->orderBy(['date' => SORT_DESC])->limit(1)->one();
    }

    /** @return array|CurrencyRates[]|\yii\db\ActiveRecord[] */
    public static function getCurrencyBetweenDates(string $dateFrom, string $dateTo, string $currencyCode)
    {
        $dateFrom = DateHelper::dateToTimeStamp($dateFrom);
        $dateTo = DateHelper::dateToTimeStamp($dateTo) + (24 * 60 * 60) - 1; // Günün sonuna təyin edirik
        return self::find()->select(['date', $currencyCode])->where(['between', 'date', $dateFrom, $dateTo])->andWhere(['active' => '1'])->orderBy(['date' => SORT_DESC])->asArray()->all();
    }

}
