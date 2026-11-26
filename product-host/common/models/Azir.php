<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use yii\db\Expression;
use common\helpers\NumberHelper;
use yii\web\UploadedFile;

class Azir extends MainModel
{
    /**
     * @var UploadedFile
     */
    public $file;

    public static function tableName()
    {
        return 'azir_indexses';
    }

    public static function collectData()
    {
        $lastDate = self::getLastDate();

        return [
            'lastDate' => $lastDate,
            'lastFaizAz' => self::getLastFaizAz(),
            'lastMinFaizAz' => self::getLastMinFaizAz($lastDate),
            'lastMaxFaizAz' => self::getLastMaxFaizAz($lastDate),
            'faizAzDifferenceLastMonth' => NumberHelper::roundIfNeeded(self::getFaizAzDifferenceLastMonth()),
            'faizAzDifferenceLastYear' => NumberHelper::roundIfNeeded(self::getFaizAzDifferenceLastYear()),
            'minFaizAz' => self::getMinFaizAz(),
            'maxFaizAz' => self::getMaxFaizAz(),
            'lastEqdHecmAz' => self::getLastEqdHecmAz(),
            'eqdHecmAzDifferenceLastMonth' => NumberHelper::roundIfNeeded(self::getEqdHecmAzDifferenceLastMonth()),
            'eqdHecmAzMinMaxLastYear' => NumberHelper::roundIfNeeded(self::getEqdHecmAzMinMaxLastYear()),
            'usdEqual' => self::getUSDEqual()
        ];
    }

    public static function getLastDate()
    {
        return self::find()
            ->select('MAX(date) AS last_date')
            ->where(['like', 'title_az', '1D AZIR%', false])
            ->scalar();
    }

    public static function getDataForMainPage(){
        $date = self::getLastDate();



        return [
            'lastDate' => $date,
            '1D'       => self::getLast($date, "1D AZIR%"),
            '30D'      => self::getLast($date,"TF AZIR 30D%"),
            '90D'      => self::getLast($date,"TF AZIR 90D%"),
            '180D'     => self::getLast($date,"TF AZIR 180D%"),
            'TFAI'     => self::getLast($date,"AZIR TFAI%"),
            'star'     => self::findStar($date, "1D AZIR%")
        ];
    }

    public static function findStar($date, $titleName1){
        $star = false;

        $query = self::find()
            ->select('title_az')
            ->andWhere(['>=', 'faiz_az', 0])
            ->andWhere(['date' => $date])
            ->andWhere(['like', 'title_az', $titleName1, false])
            ->orderBy(['id' => SORT_DESC])->scalar();

        if (strpos($query, '*') !== false) $star = true;

        return $star;
    }

    public static function getLast($date, $titleName1){
        $query = self::find()
            ->select('faiz_az')
            ->andWhere(['>=', 'faiz_az', 0])
            ->andWhere(['date' => $date]);

        $query->andWhere(['like', 'title_az', $titleName1, false]);

        return $query->orderBy(['id' => SORT_DESC])->scalar();
    }

    public static function getLastFaizAz()
    {
        return self::find()
            ->select('faiz_az')
            ->where(['like', 'title_az', '1D AZIR%', false])
            ->orderBy(['date' => SORT_DESC])
            ->scalar();
    }

    public static function getFaizAzDifferenceLastMonth()
    {
        $lastDayPreviousMonth = date('Y-m-d', strtotime('last day of last month'));
        $lastMonthFaizAz = self::find()
            ->select(['faiz_az', 'date'])
            ->where(['like', 'title_az', '1D AZIR%', false])
            ->andWhere(['>=', 'faiz_az', 0])
            ->andWhere(['<=', 'date', $lastDayPreviousMonth])
            ->orderBy(['id' => SORT_DESC])
            ->one();
        $currentMonthFaizAz = self::getLastFaizAz();
        if ($lastMonthFaizAz !== null && $currentMonthFaizAz !== null) {
            return $currentMonthFaizAz - $lastMonthFaizAz['faiz_az'];
        }
        return null;
    }

    public static function getFaizAzDifferenceLastYear()
    {
        $lastYearStart = date('Y-m-d', strtotime('last day of December last year'));

        $lastYearStartFaizAz = self::find()
            ->select(['faiz_az', 'date'])
            ->where(['<=', 'date', $lastYearStart])
            ->andWhere(['like', 'title_az', '1D AZIR%', false])
            ->andWhere(['>=', 'faiz_az', 0])
            ->orderBy(['id' => SORT_DESC])
            ->one();

        $lastYearStartFaizAz = $lastYearStartFaizAz['faiz_az'];


        $currentMonthFaizAz = self::getLastFaizAz();

        if ($lastYearStartFaizAz !== null && $currentMonthFaizAz !== null) {
            return $currentMonthFaizAz - $lastYearStartFaizAz;
        }

        return null;
    }

    public static function getMinFaizAz()
    {
        return self::find()
            ->select('faiz_az')
            ->where(['like', 'title_az', '1D AZIR%', false])
            ->andWhere(['>=', 'faiz_az', 0])
            ->andWhere(['>=', 'date', new Expression("NOW() - INTERVAL '1 year'")])
            ->orderBy(['faiz_az' => SORT_ASC])
            ->scalar();
    }

    public static function getMaxFaizAz()
    {
        return self::find()
            ->select('faiz_az')
            ->where(['like', 'title_az', '1D AZIR%', false])
            ->andWhere(['>=', 'faiz_az', 0])
            ->andWhere(['>=', 'date', new Expression("NOW() - INTERVAL '1 year'")])
            ->orderBy(['faiz_az' => SORT_DESC])
            ->scalar();
    }

    public static function getLastMinFaizAz($date)
    {
        return self::getLast($date, 'LAST MIN RATE');
    }

    public static function getLastMaxFaizAz($date)
    {
        return self::getLast($date, 'LAST MAX RATE');
    }

    public static function getLastEqdHecmAz()
    {
        return self::find()
            ->select('eqd_hecm_az')
            ->where(['like', 'title_az', '1D AZIR%', false])
            ->orderBy(['id' => SORT_DESC])
            ->scalar();
    }

    public static function getEqdHecmAzDifferenceLastMonth()
    {

        $currentValue = self::find()
            ->select('eqd_hecm_az')
            ->where(['like', 'title_az', '1D AZIR%', false])
            ->orderBy(['id' => SORT_DESC])
            ->scalar();

        $previousMonthEndValue = self::find()
            ->select('eqd_hecm_az')
            ->where(['like', 'title_az', '1D AZIR%', false])
            ->andWhere(new Expression('DATE_TRUNC(\'month\', date) = DATE_TRUNC(\'month\', NOW() - INTERVAL \'1 month\')'))
            ->orderBy(['id' => SORT_DESC])
            ->scalar();

        return $currentValue - $previousMonthEndValue;
    }

    public static function getEqdHecmAzMinMaxLastYear()
    {
        $lastYearEnd = new Expression("date_trunc('year', now() - interval '1 year')");

        $minValue = self::find()
            ->select('MIN(eqd_hecm_az)')
            ->where(['like', 'title_az', '1D AZIR%', false])
            ->andWhere(new Expression("date_trunc('year', date) >= $lastYearEnd"))
            ->andWhere(['>=', 'eqd_hecm_az', 0])
            ->scalar();

        $maxValue = self::find()
            ->select('MAX(eqd_hecm_az)')
            ->where(['like', 'title_az', '1D AZIR%', false])
            ->andWhere(new Expression("date_trunc('year', date) >= $lastYearEnd"))
            ->scalar();

        return ['min' => $minValue, 'max' => $maxValue];
    }

    public static function getUSDEqual()
    {
        $lastUSDCurrency = CurrencyRates::find()->select('usd')->orderBy(['id' => SORT_DESC])->one();

        $lastUSDCurrencyValue = $lastUSDCurrency['usd'];
        $lastEqdHecmAz = self::getLastEqdHecmAz();
        $calculation = $lastEqdHecmAz / $lastUSDCurrencyValue;

        return number_format($calculation, 2, '.', '');
    }

    public function rules()
    {
        return [
            [['file'], 'required'],
            [['file'], 'file', 'skipOnEmpty' => false, 'extensions' => 'pdf', 'checkExtensionByMimeType' => true, 'on' => 'upload'],
            ];
    }

    public function scenarios()
    {
        $scenarios = parent::scenarios();
        $scenarios['upload'] = ['file'];   // для сценария "upload" проверяем только file
        $scenarios['default'] = [];        // обычный сценарий (например, для текста)
        return $scenarios;
    }


}