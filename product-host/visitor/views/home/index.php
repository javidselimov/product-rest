<?

/* @var $this \yii\web\View
 * @var $content string
 */

use visitor\widgets\blocks\AZIRBlockWidget;
use visitor\widgets\blocks\PulBazariBlockWidget;
use yii\helpers\Url;
use visitor\widgets\blocks\CurrencyBlockWidget;
use visitor\widgets\blocks\PercentsBlockWidget;
use visitor\widgets\blocks\BanksBlockWidget;
use visitor\widgets\blocks\MoneyMarketBlockWidget;
use visitor\widgets\blocks\YieldCurveBlockWidget;
use visitor\widgets\blocks\MonetaryBlockWidget;
use visitor\widgets\PressReleasesWidget;
use visitor\widgets\GalleryWidget;
use visitor\widgets\VideoWidget;
use visitor\widgets\HomepageLinksWidget;


use common\helpers\FileHelper;
use common\models\PressReleases;
use common\models\Gallery;
use common\models\Videos;

$this->title = Yii::t('app', 'Home-Page');
$this->registerMetaTag(['property' => 'og:url', 'content' => Yii::$app->request->absoluteUrl]);
$this->registerMetaTag(['property' => 'og:type', 'content' => 'article']);
$this->registerMetaTag(['property' => 'og:title', 'content' => Yii::t('app', 'Project-Name')]);
$this->registerMetaTag(['property' => 'og:description', 'content' => $this->title]);
$this->registerMetaTag(['property' => 'og:image', 'content' => 'https://www.cbar.az/images/social-logo.png']);
?>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>

<style>
    .strategy-popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999;
    }
    .strategy-popup-content {
        position: relative;
        width: 50%;
        max-width: 600px;
        max-height: 90%;
    }
    .strategy-popup-content img {
        width: 100%;
        height: auto;
        display: block;
        cursor: pointer;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    }
    .strategy-popup-close {
        position: absolute;
        top: 10px;
        right: 15px;
        color: #333;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        line-height: 1;
        z-index: 10;
        background: rgba(255, 255, 255, 0.8);
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
    }
    @media (max-width: 768px) {
        .strategy-popup-content {
            width: 85%;
        }
        .strategy-popup-close {
            top: 5px;
            right: 5px;
        }
    }
</style>
<?
//if(Yii::$app->language == "az")
//{
    ?>
    <div id="strategyPopup" class="strategy-popup-overlay" style="display: none;">
        <div class="strategy-popup-content">
            <span class="strategy-popup-close">&times;</span>
            <?php
            $lang = Yii::$app->language;
            $imgName = ($lang === 'az') ? 'survey_banner_az.jpg' : 'survey_banner_en.jpg';
            $link = ($lang === 'az')
                    ? 'https://e-cbar.az/Survey/Info/203'
                    : 'https://e-cbar.az/Survey/Info/203';
            ?>
            <a href="<?= $link ?>" target="_blank">
                <img src="/images/<?= $imgName ?>" alt="Strategy Popup">
            </a>
        </div>
    </div>

    <script>
        $(document).ready(function() {
            $('#strategyPopup').fadeIn();

            $('.strategy-popup-close, .strategy-popup-overlay').on('click', function(e) {
                if (e.target !== this && !$(e.target).hasClass('strategy-popup-close')) return;
                $('#strategyPopup').fadeOut();
            });

            $('.strategy-popup-content a').on('click', function() {
                $('#strategyPopup').fadeOut();
            });
        });
    </script>
    <?
//}
?>




<style>
    /* Hide scrollbars for the publication and links grids */
    .cbar-publications-grid,
    .cbar-links-grid {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }

    .cbar-publications-grid::-webkit-scrollbar,
    .cbar-links-grid::-webkit-scrollbar {
        display: none; /* Chrome, Safari and Opera */
    }

    .finance-section {
        /*background: #f4f6f8;*/
        padding: 40px 0;
    }

    .finance-container {
        width: 100%;
        margin: 0;
        padding: 0;
    }

    .finance-grid {
        display: flex;
        gap: 24px;
        align-items: stretch;
    }

    .left-column {
        flex: 2;
        display: flex;
        flex-direction: column;
        gap: 24px;
        min-width: 0;
    }

    .right-column {
        flex: 1.3;
        min-width: 0;
    }

    /* TOP ROW (AZN + FAIZ) */
    .top-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
    }

    /* CARD */
    .card {
        background: #ffffff;
        padding: 20px;
        /*border-radius: 12px;*/
        /*box-shadow: 0 4px 15px rgba(0,0,0,0.05);*/
        display: flex;
        flex-direction: column;
        border: 1px solid #D9D9D9;
    }

    .card h3 {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 15px;
        color: #1c3550;
        /*text-transform: uppercase;*/
    }

    .card-title {
        font-size: 22px;
        font-weight: 600;
        color: #1c3550;
        margin-bottom: 15px;
        /*text-transform: uppercase;*/
    }

    .card-date {
        font-size: 14px;
        font-weight: 400;
        color: #888;
        margin-bottom: 20px;
    }

    /* AZN CARD */
    .currency-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
        padding-bottom: 10px;
    }

    .currency-name {
        font-size: 16px;
        color: #555;
    }

    .currency-name-with-flag {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .currency-flag {
        width: 24px;
        height: auto;
        /* Optional: add a small border or shadow if needed */
        /* border: 1px solid #eee; */
    }

    .currency-right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
        min-width: 80px;
    }

    .currency-value {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        text-align: right;
    }

    /* Indicators */
    .indicator-container {
        width: 12px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;
    }

    .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
    }

    .dot.neutral {
        background: #d6d6d6;
    }

    .arrow {
        font-size: 18px;
        line-height: 1;
        font-weight: bold;
        display: inline-block;
    }

    .arrow.up {
        color: #28a745;
    }

    .arrow.down {
        color: #e04545;
    }

    .btn-primary-outline {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 14px 24px;
        border: 1px solid #1c3550;
        /*border-radius: 6px;*/
        color: #1c3550;
        text-decoration: none;
        font-size: 16px;
        font-weight: 500;
        margin-top: auto;
        transition: 0.3s;
        width: 100%;
    }

    .btn-primary-outline:hover {
        background: #1c3550;
        color: #fff;
        text-decoration: none;
    }

    .btn-arrow {
        font-size: 18px;
    }

    /* FAIZ CARD */
    .rate-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        margin-bottom: 12px;
        font-size: 16px;
        color: #555;
        border-radius: 10px;
        text-decoration: none;
        transition: 0.3s;
    }

    .rate-item:hover {
        background: #fff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        /*box-shadow: 0 0 25px 5px rgba(0, 0, 0, 0.1);*/
        text-decoration: none;
        color: #1c3550;

        transition: box-shadow 0.3s ease;
    }

    .rate-item.active {
        background: #f1f3f4;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        color: #1c3550;
    }

    .rate-right {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .rate-right strong {
        font-size: 16px;
        font-weight: 600;
        color: #333;

    }

    .external {
        font-size: 18px;
        color: #1c3550;
    }

    .currency-list {
        list-style: none;
        padding: 0;
        margin: 0 0 20px;
    }

    .currency-list li {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f0f0f0;
    }

    .currency-list li:last-child {
        border-bottom: none;
    }

    .currency-list li span {
        color: #555;
    }

    .currency-list li strong {
        color: #1c3550;
    }

    .rate-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
    }

    .rate-row:last-child {
        border-bottom: none;
    }

    .rate-row span {
        color: #555;
    }

    .rate-row strong {
        color: #1c3550;
    }

    .chart-placeholder {
        background: #fff;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px;
        /*margin-top: 20px;*/
    }

    .chart-placeholder.large {
        height: 280px;
        margin-bottom: 20px;
    }

    /* Prevent chart/content overlap inside inflation card */
    .inflation-card .chart-placeholder {
        position: relative;
        overflow: hidden;
    }
    .inflation-card .chart-placeholder.large {
        /* Let canvas control the height when needed to avoid overlap */
        height: auto;
        min-height: 260px;
    }
    .inflation-card .chart-placeholder.large canvas {
        width: 100% !important;
        height: auto !important;
        display: block;
        max-height: 300px;
    }

    .chart-placeholder.tall {
        height: 310px;
        margin-bottom: 20px;
        position: relative;
        overflow: hidden;
    }

    .pul-bazari .chart-placeholder.tall canvas {
        width: 100% !important;
        height: auto !important;
        display: block;
        max-height: 290px;
    }

    .inflation-info {
        display: flex;
        gap: 15px;
    }

    .inflation-info div {
        flex: 1;
        background: #e0f4fb;
        padding: 14px;
        /*border-radius: 8px;*/
        text-align: center;
    }

    .inflation-info div span {
        display: block;
        font-size: 14px;
        color: #888;
        margin-bottom: 5px;

    }

    .inflation-info div strong {
        display: block;
        font-size: 16px;
        color: #1c3550;
    }

    .azir-stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 20px;
    }

    .stat-box {
        background: #f7f9fb;
        padding: 14px;
        /*border-radius: 8px;*/
        text-align: center;
    }

    .stat-box span {
        display: block;
        font-size: 11px;
        color: #888;
        margin-bottom: 5px;
        height: 26px;
        line-height: 1.2;
    }

    .stat-box strong {
        display: block;
        font-size: 15px;
        color: #1c3550;
    }

    /* PUL BAZARI NEW STYLES */
    .pul-bazari {
        border: 1px solid #D9D9D9;
        padding: 20px;
    }

    .pul-bazari .title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 15px;
        color: #1c3550;
        /*text-transform: uppercase;*/
    }

    .azir-current {
        display: flex;
        justify-content: flex-start;
        gap: 20px;
        align-items: center;
        margin: 15px 0 20px;
        font-size: 15px;
    }

    .azir-left {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #333;
        position: relative;
    }
    .azir-left SPAN{
        font-size: 16px;
    }

    .info-icon {
        width: 18px;
        height: 18px;
        min-width: 18px;
        min-height: 18px;
        flex-shrink: 0;
        border-radius: 50%;
        border: 1px solid #333;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        cursor: pointer;
        color: #333;
    }

    .info-popup {
        display: none;
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: #1c3550;
        color: #fff;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 13px;
        line-height: 1.4;
        width: 280px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        margin-bottom: 10px;
        text-align: left;
    }

    .info-popup::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 6px;
        border-style: solid;
        border-color: #1c3550 transparent transparent transparent;
    }

    .info-popup.show {
        display: block;
    }

    .azir-value {
        font-weight: 600;
        font-size: 16px;
        color: #333;
    }

    .pul-bazari .azir-stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin-bottom: 25px;
    }

    .pul-bazari .stat-box {
        /*border: 1px solid #e3e7ec;*/
        padding: 15px;
        /*border-radius: 8px;*/
        background: #e0f4fb;
        text-align: left;
    }

    .pul-bazari .stat-title {
        font-size: 14px;
        font-weight: 400;
        margin-bottom: 8px;
        color: #666;
        height: 32px;
        line-height: 1.4;
    }

    .pul-bazari .stat-value {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 4px;
        color: #333;
    }

    .pul-bazari .stat-sub {
        font-size: 12px;
        color: #999;
    }

    .pul-bottom {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-top: auto;
    }

    .pul-links {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .pul-links a {
        text-decoration: none;
        color: #555;
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: 0.3s;
    }

    .pul-links a:hover {
        color: #1c3550;
        text-decoration: underline;
    }

    .doc-icon {
        font-size: 16px;
    }

    .btn-outline {
        display: inline-block;
        padding: 14px 30px;
        border: 1px solid #1c3550;
        /*border-radius: 6px;*/
        color: #1c3550;
        text-decoration: none;
        font-size: 16px;
        font-weight: 500;
        transition: 0.3s;
        text-align: center;
        margin-top: auto;
    }

    .btn-outline:hover {
        background: #1c3550;
        color: #fff;
        text-decoration: none;
    }

    /* RESPONSIVE */

    @media (max-width: 1370px) {
        .card-title {
            font-size: 20px;
        }

        .currency-name {
            font-size: 16px;
        }

        .currency-value {
            font-size: 18px;
        }
    }

    .stat-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
    }

    .stat-row span {
        flex: 1;
    }

    .stat-row strong {
        flex-shrink: 0;
        text-align: right;
    }

    @media (max-width: 1100px) {
        .finance-grid {
            flex-direction: column;
        }

        .left-column, .right-column {
            flex: 1;
            width: 100%;
        }

        .top-row {
            gap: 15px;
        }

        .pul-bazari .chart-placeholder.tall {
            height: auto;
            min-height: 250px;
        }
    }

    @media (max-width: 1080px) {
        .card {
            padding: 20px;
        }

        .pul-bazari .azir-stats {
            gap: 10px;
        }
    }

    /* Fix overlap of inflation-info and chart between 880px and 1100px */
    @media (min-width: 880px) and (max-width: 1100px) {
        .inflation-card .chart-placeholder.large {
            min-height: 320px; /* give more room for responsive canvas */
        }
        .inflation-card .inflation-info {
            margin-top: 16px;
        }
    }

    @media (max-width: 768px) {


        .azir-stats {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 666px) {


        #money-market-chart-new {
            margin-left: -30px;
        }

        #yieldCurveChart{
            margin-left: -30px;
        }
    }

    @media (max-width: 568px) {
        .finance-section {
            padding: 20px 15px;
        }

        .inflation-info {
            flex-direction: column;
        }

        .inflation-card .chart-placeholder.large {
            height: 350px;
        }

        .inflation-card .chart-placeholder.large canvas {
            height: 100% !important;
        }

        .top-row {
            grid-template-columns: 1fr;
        }

        .pul-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
        }

        .btn-outline {
            width: 100%;
        }
    }

    @media (max-width: 480px) {
        .azir-current {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
        }

        .azir-left {
            flex-wrap: wrap;
            width: 100%;
        }

        .info-popup {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            width: 280px;
            margin: 0 0 10px 0;
            order: 2;
        }

        .info-popup::after {
            display: block;
        }

        .azir-left span:first-child {
            order: 0;
        }

        .info-icon {
            order: 1;
        }

        .azir-value {
            margin-left: 0;
        }
    }

    @media (max-width: 400px) {
        .pul-bazari .stat-title {
            height: auto;
            min-height: 40px;
        }

        .stat-box span {
            height: auto;
            min-height: 30px;
        }
    }

    @media (min-width: 900px) {
        /*.relize {
            width: 310px !important;
        }

        .ratings {
            width: 275px !important;
        }

        .diagramm {
            width: 320px !important;
        }*/
    }


    /* Horizontal news block styles */
    .news-block-horizontal {
        /*padding: 30px 0;*/
        background-color: #f9f9f9;
    }

    .news-block-horizontal .col_title {
        font-size: 24px;
        margin-bottom: 20px;
        font-weight: bold;
    }

    .horizontal-news-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        margin: 0 -8px;
    }

    .horizontal-news-item {
        width: calc(16.666% - 16px);
        margin: 0 8px 30px;
        background: #fff;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        /*border-radius: 5px;*/
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .news-image {
        width: 100%;
        height: 0;
        padding-bottom: 75%; /* This creates a 4:3 aspect ratio (75% = 3/4 * 100%) */
        position: relative;
        overflow: hidden;
    }

    .news-image img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        background-color: #fff;
        position: absolute;
        top: 0;
        left: 0;
    }

    .news-title {
        padding: 15px 15px 5px;
    }

    .news-title h3 {
        font-size: 16px;
        margin: 0;
        line-height: 1.3;
        /*height: 42px;*/
        overflow: hidden;
    }

    .news-description {
        padding: 0 15px 15px;
        flex-grow: 1;
    }

    .news-description p {
        font-size: 14px;
        line-height: 1.4;
        margin: 0;
        color: #666;
        height: 60px;
        overflow: hidden;
    }

    .news-date-main {
        text-align: left;
        padding-bottom: 20px;
        font-size: 14px;
        font-weight: 400;
        color: #888;
    }

    .news-date-main span {
        font-size: 12px;
        color: #000;
        font-style: italic;
    }

    .news-date-second {
        text-align: left;
        padding-bottom: 20px;
        font-size: 14px;
        font-weight: 400;
    }

    .news-date-second span {
        font-size: 12px;
        color: #000;
        font-style: italic;
    }

    .news-button {
        /*padding: 0 15px 15px;*/
        margin-top: auto;
    }

    .news-button .blue_btn {
        display: inline-block;
        /*padding: 8px 15px;*/
        font-size: 14px;
        width: 100%;
        text-align: center;
    }

    .news-footer {
        text-align: center;
        margin-top: 20px;
    }

    /* Responsive styles */
    @media (max-width: 1200px) {
        .horizontal-news-item {
            width: calc(25% - 16px);
        }
    }

    @media (max-width: 992px) {
        .horizontal-news-item {
            width: calc(33.333% - 16px);
        }
    }

    @media (max-width: 768px) {
        .horizontal-news-item {
            width: calc(50% - 16px);
        }
    }

    @media (max-width: 576px) {
        .horizontal-news-item {
            width: calc(100% - 16px);
            margin: 0 8px 20px;
        }
    }

    @media (min-width: 1101px) {
        .homepage-banner {
            min-height: 230px;
            display: flex;
            align-items: center;
            padding: 20px 40px !important;
        }

        .homepage-banner .banner-inner {
            flex: 1;
        }

        /* BLOCK K (Banking Sector) - он последний в сайдбаре */
        .sidebar .widget:last-child {
            min-height: 212px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
    }

</style>

<?
use common\models\CurrencyRates;
use common\models\InfoLines;
use common\models\Azir;
use common\models\MonthlyInflationParameters;
use common\helpers\DateHelper;
use visitor\helpers\HtmlHelper;
use yii\helpers\Html;

$lastCurrency = CurrencyRates::getLastCurrency(['usd', 'eur', 'rub', 'try', 'date']);
$prevCurrency = CurrencyRates::getPreviousCurrency(['usd', 'eur', 'rub', 'try', 'date']);

$coridorMin = InfoLines::getLastValueByAlias('corridor_min');
$coridorMax = InfoLines::getLastValueByAlias('corridor_max');
$coridorPercent = InfoLines::getLastValueByAlias('corridor_percent');
$azirData = Azir::getDataForMainPage();

$inflationParams = MonthlyInflationParameters::find()->one();

$pressReleasesData = PressReleases::getDb()->cache(function ($db) {
    return PressReleases::find()
        ->with('pressReleasesAssets')
        ->where(['active' => '1', 'type' => '1'])
        ->andWhere(['<=', 'date', date('Y-m-d')])
        ->orderBy(['date' => SORT_DESC, 'id' => SORT_DESC])
        ->limit(4)
        ->all();
}, Yii::$app->params['dbCacheTimeout']);

// Ensure only active records and current/past dates are shown even if cache is stale
if (!empty($pressReleasesData)) {
    $pressReleasesData = array_filter($pressReleasesData, function($item) {
        return $item->active == 1 && $item->date <= date('Y-m-d');
    });
    $pressReleasesData = array_values($pressReleasesData);
}

$galleriesData = Gallery::getDb()->cache(function ($db) {
    return Gallery::find()
        ->where(['active' => '1'])
        ->andWhere(['<=', 'date', date('Y-m-d')])
        ->with(['coverImage'])
        ->orderBy(['date' => SORT_DESC, 'id' => SORT_DESC])
        ->limit(4)
        ->all();
}, Yii::$app->params['dbCacheTimeout']);

// Ensure only active records and current/past dates are shown even if cache is stale
if (!empty($galleriesData)) {
    $galleriesData = array_filter($galleriesData, function($item) {
        return $item->active == 1 && $item->date <= date('Y-m-d');
    });
    $galleriesData = array_values($galleriesData);
}

$videosData = Videos::getDb()->cache(function ($db) {
    return Videos::find()
        ->where(['active' => '1'])
        ->andWhere(['<=', 'date', date('Y-m-d')])
        ->orderBy(['date' => SORT_DESC, 'position' => SORT_DESC])
        ->limit(4)
        ->all();
}, Yii::$app->params['dbCacheTimeout']);

// Ensure only active records and current/past dates are shown even if cache is stale
if (!empty($videosData)) {
    $videosData = array_filter($videosData, function($item) {
        return $item->active == 1 && $item->date <= date('Y-m-d');
    });
    $videosData = array_values($videosData);
}
?>

<?
function getTrendIndicator($current, $previous) {
    if ($current > $previous) {
        return '<div class="indicator-container"><span class="arrow up">↑</span></div>';
    } elseif ($current < $previous) {
        return '<div class="indicator-container"><span class="arrow down">↓</span></div>';
    } else {
        return '<div class="indicator-container"><span class="dot neutral"></span></div>';
    }
}
?>

<section class="finance-section">

    <div class="container">
        <div class="finance-container">

        <div class="finance-grid">

            <!-- LEFT COLUMN -->
            <div class="left-column">

                <!-- TOP BLOCK (AZN + FAIZ) -->
                <div class="top-row">

                    <!-- AZN MƏZƏNNƏSİ -->
                    <div class="card azn-card">
                        <h3 class="card-title"><?= Yii::t('app', 'AZN-Currency') ?></h3>
                        <p class="card-date"><?= Yii::t('app', 'From currency {date}', ['date' => DateHelper::showDate($lastCurrency->date, 'dd.MM.YYYY')]) ?></p>

                        <div class="currency-row">
                            <div class="currency-name-with-flag">
                                <img src="images/flag-usa.svg" alt="USD flag" class="currency-flag">
                                <span class="currency-name">1 USD</span>
                            </div>
                            <div class="currency-right">
                                <span class="currency-value"><?= HtmlHelper::currencyFormat($lastCurrency->usd) ?></span>
                                <?= getTrendIndicator($lastCurrency->usd, $prevCurrency->usd) ?>
                            </div>
                        </div>

                        <div class="currency-row">
                            <div class="currency-name-with-flag">
                                <img src="images/flag-eur.svg" alt="EUR flag" class="currency-flag">
                                <span class="currency-name">1 EUR</span>
                            </div>
                            <div class="currency-right">
                                <span class="currency-value"><?= HtmlHelper::currencyFormat($lastCurrency->eur) ?></span>
                                <?= getTrendIndicator($lastCurrency->eur, $prevCurrency->eur) ?>
                            </div>
                        </div>

                        <div class="currency-row">
                            <div class="currency-name-with-flag">
                                <img src="images/flag-rus.svg" alt="RUB flag" class="currency-flag">
                                <span class="currency-name">100 RUB</span>
                            </div>
                            <div class="currency-right">
                                <span class="currency-value"><?= HtmlHelper::currencyFormat($lastCurrency->rub) ?></span>
                                <?= getTrendIndicator($lastCurrency->rub, $prevCurrency->rub) ?>
                            </div>
                        </div>

                        <div class="currency-row">
                            <div class="currency-name-with-flag">
                                <img src="images/flag-tr.svg" alt="TRY flag" class="currency-flag">
                                <span class="currency-name">1 TRY</span>
                            </div>
                            <div class="currency-right">
                                <span class="currency-value"><?= HtmlHelper::currencyFormat($lastCurrency->try) ?></span>
                                <?= getTrendIndicator($lastCurrency->try, $prevCurrency->try) ?>
                            </div>
                        </div>

                        <a href="<?= Url::to(['currency/rates']) ?>" class="btn-primary-outline">
                            <?= Yii::t('app', 'Full-List-Button') ?>
<!--                            <span class="btn-arrow">→</span>-->
                        </a>
                    </div>


                    <!-- FAİZ DƏHLİZİ -->
                    <div class="card faiz-card">
                        <h3 class="card-title"><?= Yii::t('app', 'Interest-Rates') ?></h3>
                        <p class="card-date"><?= Yii::t('app', 'From currency {date}', ['date' => DateHelper::showDate($coridorMin['date'], 'dd.MM.YYYY')]) ?></p>

                        <a href="<?= Url::to(['info-blocks/index', 'alias' => 'corridor_min']) ?>" class="rate-item ">
                            <span><?= Yii::t('app', 'corridor-floor') ?></span>
                            <div class="rate-right">
                                <strong><?= $coridorMin['value'] ?></strong>
                                <?/*<span class="external">↗</span>*/?>
                            </div>
                        </a>

                        <a href="<?= Url::to(['info-blocks/index', 'alias' => 'corridor_max']) ?>" class="rate-item">
                            <span><?= Yii::t('app', 'corridor-cell') ?></span>
                            <div class="rate-right">
                                <strong><?= $coridorMax['value'] ?></strong>
                                <?/*<span class="external">↗</span>*/?>
                            </div>
                        </a>

                        <a href="<?= Url::to(['info-blocks/index', 'alias' => 'corridor_percent']) ?>" class="rate-item">
                            <span><?= Yii::t('app', 'refinancing-rate') ?></span>
                            <div class="rate-right">
                                <strong><?= $coridorPercent['value'] ?></strong>
                                <?/*<span class="external">↗</span>*/?>
                            </div>
                        </a>
                    </div>

                </div>

                <!-- BOTTOM BLOCK (INFLYASIYA) -->
                <div class="card inflation-card">
                    <h3><?= Yii::t('app', 'Inflation') ?></h3>

                    <div class="chart-placeholder large">
                        <canvas id="myChart" width="600" height="260"></canvas>
                    </div>

                    <div class="inflation-info">
                        <div>
                            <span><?= Yii::t('app', 'current-inflation') ?></span>
                            <strong>
                                <?= $inflationParams ? (float)$inflationParams->current_inflation : '' ?>%
                                - <?= Yii::$app->formatter->asDate($inflationParams->next_update_date, 'MMMM yyyy') ?>
                            </strong>
                        </div>
                        <div>
                            <span><?= Yii::t('app', 'target-inflation') ?></span>
                            <strong><?= $inflationParams ? $inflationParams->target_inflation : ''?> %</strong>
                        </div>
                    </div>
                </div>

            </div>

            <!-- RIGHT COLUMN (PUL BAZARI) -->
            <div class="card right-column pul-bazari">
                <h3 class="title"><?= Yii::t('app', 'Pul Bazari') ?></h3>
                <p class="card-date"><?= Yii::t('app', 'From {date}', ['date' => date('d.m.Y', strtotime($azirData['lastDate']))]) ?></p>
               
                <div class="chart-placeholder tall">
                    <canvas id="money-market-chart-new" data-version="homepage" width="400" height="300"></canvas>
                </div>

                <!-- AZIR current row -->
                <div class="azir-current">
                    <div class="azir-left">
                        <span>AZIR (Azerbaijan Interbank Rate)</span>
                        <span class="info-icon" style="cursor: pointer;" onclick="toggleInfoPopup(event)" title="<?= Yii::t('app', 'AZIR Chart Title') ?>">i</span>
                        <div id="azir-info-popup" class="info-popup">
                            <?= Yii::t('app', 'AZIR Chart Title') ?>
                        </div>
                    </div>
                    <div class="azir-value"><?= $azirData['1D'] ?>%</div>
                </div>

                <!-- Stats boxes -->
                <div class="azir-stats">
                    <div class="stat-box">
                        <div class="stat-title"><?= Yii::t('app', 'AZIR Chart Desc2') ?></div>
                        <div class="stat-value"><?= $azirData['30D'] ?>%</div>
<!--                        <div class="stat-sub">--><?php //= Yii::t('app', 'toplanan') ?><!--</div>-->
                    </div>

                    <div class="stat-box">
                        <div class="stat-title"><?= Yii::t('app', 'AZIR Chart Desc3') ?></div>
                        <div class="stat-value"><?= $azirData['90D'] ?>%</div>
<!--                        <div class="stat-sub">--><?php //= Yii::t('app', 'toplanan') ?><!--</div>-->
                    </div>

                    <div class="stat-box">
                        <div class="stat-title"><?= Yii::t('app', 'AZIR Chart Desc4') ?></div>
                        <div class="stat-value"><?= $azirData['180D'] ?>%</div>
<!--                        <div class="stat-sub">--><?php //= Yii::t('app', 'toplanan') ?><!--</div>-->
                    </div>

                    <div class="stat-box">
                        <div class="stat-title"><?= Yii::t('app', 'AZIR Chart Desc5') ?></div>
                        <div class="stat-value"><?= $azirData['TFAI'] ?></div>
<!--                        <div class="stat-sub">--><?php //= Yii::t('app', 'toplanan') ?><!--</div>-->
                    </div>
                </div>

                <!-- Bottom row -->
                <div class="pul-bottom">
                    <div class="pul-links">
                        <a href="/methodology_for_azir_<?=Yii::$app->language?>.pdf" target="_blank">
                            <span class="doc-icon">📄</span>
                            <?= Yii::t('app', 'AZIR BTN3') ?>
                        </a>

                        <a href="/compounded_term.pdf" target="_blank">
                            <span class="doc-icon">📄</span>
                            <?= Yii::t('app', 'AZIR BTN2') ?>
                        </a>
                    </div>

                    <a href="<?= Url::to(['indeks/rates']) ?>" class="btn-outline">
                        <?= Yii::t('app', 'AZIR BTN1') ?>
                    </a>
                </div>
            </div>

        </div>

    </div>

    </div>

</section>





<section class="homepage-news">
    <div class="container">

        <div class="news-flex-row">
            <!-- BLOCK Z (Wrapper for A and X) -->
            <div class="press-main-col">
                <!-- BLOCK A -->
                <div class="press-container">

                    <!-- TABS -->
                    <div class="press-tabs">
                        <button class="tab-btn active" data-tab="press"><?= Yii::t('app', 'Press-Releases') ?></button>
                        <button class="tab-btn" data-tab="photos"><?= Yii::t('app', 'Photos') ?></button>
                        <button class="tab-btn" data-tab="videos"><?= Yii::t('app', 'Videos') ?></button>
                    </div>

                <!-- TAB CONTENT -->
                <div class="tab-content active" id="press">
                    <div class="press-inner">
                        <? if (!empty($pressReleasesData)): ?>
                            <?
                                $mainPress = $pressReleasesData[0];
                                $otherPress = array_slice($pressReleasesData, 1);
                                $mainImageUrl = '';
                                $mainImageFile = FileHelper::getFirstImage($mainPress->pressReleasesAssets);
                                if ($mainImageFile) {
                                    $mainImageUrl = Yii::$app->params['uploadsUrl'] . '/press-releases/' . $mainImageFile;
                                }
                                $mainTitle = $mainPress->{'title_' . Yii::$app->language};
                                $mainContent = strip_tags($mainPress->{'content_' . Yii::$app->language});
                                $mainShortContent = mb_substr($mainContent, 0, 700) . (mb_strlen($mainContent) > 700 ? '...' : '');
                                $mainDate = DateHelper::showDate($mainPress->date);
                                $mainUrl = Url::to(['press-releases/detail', 'id' => $mainPress->id, 'slug' => $mainPress->slug]);
                            ?>
                            <!-- LEFT MAIN NEWS -->
                            <div class="press-left">
                                <a href="<?= $mainUrl ?>" class="main-news-card" data-title="<?= Html::encode($mainTitle) ?>">
                                    <div class="ratio-4-3">
                                        <img src="<?= $mainImageUrl ?>" alt="<?= Html::encode($mainTitle) ?>">
                                    </div>
                                    <div class="main-news-content">
                                        <span class="news-date-main"><?= $mainDate ?></span>
                                        <h2><?= $mainTitle ?></h2>
                                        <p><?= $mainShortContent ?></p>
                                    </div>
                                </a>
                            </div>

                            <!-- RIGHT 3 NEWS -->
                            <div class="press-right">
                                <? foreach ($otherPress as $press): ?>
                                    <?
                                        $imgUrl = '';
                                        $imageFile = FileHelper::getFirstImage($press->pressReleasesAssets);
                                        if ($imageFile) {
                                            $imgUrl = Yii::$app->params['uploadsUrl'] . '/press-releases/' . $imageFile;
                                        }
                                        $pTitle = $press->{'title_' . Yii::$app->language};
                                        $pDate = DateHelper::showDate($press->date);
                                        $pUrl = Url::to(['press-releases/detail', 'id' => $press->id, 'slug' => $press->slug]);
                                    ?>
                                    <a href="<?= $pUrl ?>" class="right-news-card">
                                        <div class="ratio-4-3">
                                            <img src="<?= $imgUrl ?>" alt="<?= Html::encode($pTitle) ?>">
                                            <div class="overlay">
                                                <span class="news-date-second"><?= $pDate ?></span>
                                                <h3><?= $pTitle ?></h3>
                                            </div>
                                        </div>
                                    </a>
                                <? endforeach; ?>

                                <!-- MORE LINK -->
                                <div class="press-more">
                                    <a href="<?= Url::to(['press-releases/index', 'type' => '1']) ?>" class="btn-primary-outline">
                                        <?= Yii::t('app', 'All news') ?>
<!--                                        <span class="arrow">→</span>-->
                                    </a>
                                </div>
                            </div>
                        <? endif; ?>
                    </div>
                </div>

                <!-- PHOTOS TAB -->
                <div class="tab-content" id="photos">
                    <div class="press-inner">
                        <? if (!empty($galleriesData)): ?>
                            <?
                                $mainGallery = $galleriesData[0];
                                $otherGalleries = array_slice($galleriesData, 1);
                                $mainGalleryImg = Yii::$app->params['uploadsUrl'] . '/photo-gallery/' . $mainGallery->coverImage->filename;
                                $mainGalleryTitle = $mainGallery->{'title_' . Yii::$app->language};
                                $mainGalleryDate = DateHelper::showDate($mainGallery->date, 'dd.MM.YYYY');
                                $mainGalleryUrl = Url::to(['/gallery/photos/detail', 'id' => $mainGallery->id]);
                            ?>
                            <div class="press-left">
                                <a href="<?= $mainGalleryUrl ?>" class="main-news-card" data-title="<?= Html::encode($mainGalleryTitle) ?>">
                                    <div class="ratio-4-3">
                                        <img src="<?= $mainGalleryImg ?>" alt="<?= Html::encode($mainGalleryTitle) ?>">
                                    </div>
                                    <div class="main-news-content">
                                        <span class="news-date-main"><?= $mainGalleryDate ?></span>
                                        <h2><?= $mainGalleryTitle ?></h2>
                                    </div>
                                </a>
                            </div>
                            <div class="press-right">
                                <? foreach ($otherGalleries as $gallery): ?>
                                    <?
                                        $gImg = Yii::$app->params['uploadsUrl'] . '/photo-gallery/' . $gallery->coverImage->filename;
                                        $gTitle = $gallery->{'title_' . Yii::$app->language};
                                        $gDate = DateHelper::showDate($gallery->date, 'dd.MM.YYYY');
                                        $gUrl = Url::to(['/gallery/photos/detail', 'id' => $gallery->id]);
                                    ?>
                                    <a href="<?= $gUrl ?>" class="right-news-card">
                                        <div class="ratio-4-3">
                                            <img src="<?= $gImg ?>" alt="<?= Html::encode($gTitle) ?>">
                                            <div class="overlay">
                                                <span class="news-date-second"><?= $gDate ?></span>
                                                <h3><?= $gTitle ?></h3>
                                            </div>
                                        </div>
                                    </a>
                                <? endforeach; ?>

                                <!-- MORE LINK -->
                                <div class="press-more">
                                    <a href="<?= Url::to(['/gallery/photos']) ?>" class="btn-primary-outline">
                                        <?= Yii::t('app', 'Photos-List-Button') ?>
<!--                                        <span class="arrow">→</span>-->
                                    </a>
                                </div>
                            </div>
                        <? endif; ?>
                    </div>
                </div>

                <!-- VIDEOS TAB -->
                <div class="tab-content" id="videos">
                    <div class="press-inner videogallery">
                        <? if (!empty($videosData)): ?>
                            <?
                                $mainVideo = $videosData[0];
                                $otherVideos = array_slice($videosData, 1);
                                $mainVideoImg = HtmlHelper::getYouTubeThumbnail($mainVideo->url);
                                $mainVideoTitle = $mainVideo->{'title_' . Yii::$app->language};
                                $mainVideoDate = DateHelper::showDate($mainVideo->date, 'dd.MM.YYYY');
                                // Videos usually open in a popup via lightgallery, but here we can link to the video index or a detail page if it exists.
                                // VideoWidget uses lightgallery classes but we'll use links for now or consistent layout.
                                $mainVideoUrl = $mainVideo->url; 
                            ?>
                            <div class="press-left">
                                <div class="main-news-card video-card video-card-popup" data-src="<?= $mainVideoUrl ?>" data-sub-html="<?= Html::encode($mainVideoTitle) ?>" style="cursor: pointer;">
                                    <div class="ratio-4-3">
                                        <img src="<?= $mainVideoImg ?>" alt="<?= Html::encode($mainVideoTitle) ?>">
                                        <div class="play-overlay">
                                            <img src="/images/play-button.png" class="play-button" style="width: 60px; height: 60px;">
                                        </div>
                                    </div>
                                    <div class="main-news-content">
                                        <span class="news-date-main"><?= $mainVideoDate ?></span>
                                        <h2><?= $mainVideoTitle ?></h2>
                                    </div>
                                </div>
                            </div>
                            <div class="press-right">
                                <? foreach ($otherVideos as $video): ?>
                                    <?
                                        $vImg = HtmlHelper::getYouTubeThumbnail($video->url);
                                        $vTitle = $video->{'title_' . Yii::$app->language};
                                        $vDate = DateHelper::showDate($video->date, 'dd.MM.YYYY');
                                        $vUrl = $video->url;
                                    ?>
                                    <div class="right-news-card video-card video-card-popup" data-src="<?= $vUrl ?>" data-sub-html="<?= Html::encode($vTitle) ?>" style="cursor: pointer;">
                                        <div class="ratio-4-3">
                                            <img src="<?= $vImg ?>" alt="<?= Html::encode($vTitle) ?>">
                                            <div class="overlay">
                                                <span class="news-date-second"><?= $vDate ?></span>
                                                <h3><?= $vTitle ?></h3>
                                            </div>
                                        </div>
                                    </div>
                                <? endforeach; ?>

                                <!-- MORE LINK -->
                                <div class="press-more">
                                    <a href="<?= Url::to(['/videos']) ?>" class="btn-primary-outline">
                                        <?= Yii::t('app', 'Videos-List-Button') ?>
<!--                                        <span class="arrow">→</span>-->
                                    </a>
                                </div>
                            </div>
                        <? endif; ?>
                    </div>
                </div>

            </div>

            <!-- BLOCK X (BANNER) -->
            <section class="homepage-banner">
                <div class="banner-inner">
                    <div class="banner-content">
                        <h2 class="banner-title">
                            <?= Yii::t('app', 'Banner-Title') ?>
                        </h2>
                        <p class="banner-description">
                            <?= Yii::t('app', 'Banner-Description') ?>
                        </p>
                    </div>
                    <div class="banner-action">
                        <a href="https://coin.e-cbar.az/" class="banner-btn" target="_blank">
                            <?= Yii::t('app', 'yubiley-btn') ?>
                        </a>
                    </div>
                </div>
            </section>

        </div>

        <!-- BLOCK B (SIDEBAR) -->
            <div class="sidebar">

                <!-- BLOCK D -->
                <?
                    $moneyReserve = \common\models\InfoLines::getLastValueByAlias('money_reserve_usd');
                    $moneyBase = \common\models\InfoLines::getLastValueByAlias('money_base');
                    $monDate = \common\helpers\DateHelper::showDate($moneyReserve['date'], 'dd.MM.YYYY');
                ?>
                <div class="widget collapsible-widget">
                    <h3><? echo Yii::t('app', 'Monetary-Indicators') ?></h3>
                    <div class="widget-content">
                        <p class="widget-date"><? echo Yii::t('app', 'Monetary-Indicators-date-en') ?><?= $monDate ?> <? echo Yii::t('app', 'Monetary-Indicators-date-az') ?></p>

                        <a href="<?= Url::to(['info-blocks/index', 'alias' => 'money_reserve_usd']) ?>" class="stat-row">
                            <span><?= Yii::t('app', 'Official-Foreign-Exchange-Reserves') ?></span>
                            <strong><?= $moneyReserve['value'] ?> <?= Yii::t('app', 'Monetary-Indicators-date-usd') ?></strong>
                        </a>

                        <a href="<?= Url::to(['info-blocks/index', 'alias' => 'money_base']) ?>" class="stat-row">
                            <span><?= Yii::t('app', 'Money-Base') ?></span>
                            <strong><?= $moneyBase['value'] ?> <?= Yii::t('app', 'Monetary-Indicators-date-azn') ?></strong>
                        </a>
                    </div>
                </div>

                <!-- BLOCK E -->
                <?
                    // Данные для блока "Mərkəzi Bankın notları" (аналогично MoneyMarketBlockWidget)
                    $mmData = [
                        'notsVolume'   => \common\models\InfoLines::getLastValueByAlias('nots_volume'),
                        'notsLevels7'  => \common\models\InfoLines::getLastValueByAlias('nots_levels_7'),
                        'notsLevels28' => \common\models\InfoLines::getLastValueByAlias('nots_levels_28'),
                        'notsLevels84' => \common\models\InfoLines::getLastValueByAlias('nots_levels_84'),
                        'notsLevels168'=> \common\models\InfoLines::getLastValueByAlias('nots_levels_168'),
                        'notsLevels252'=> \common\models\InfoLines::getLastValueByAlias('nots_levels_252'),
                    ];

                    // Последняя дата по всем доступным показателям
                    $mmDates = [];
                    foreach ($mmData as $item) {
                        if ($item instanceof \common\models\InfoLines && !empty($item->date)) {
                            $mmDates[] = is_numeric($item->date) ? $item->date : strtotime($item->date);
                        } elseif (is_array($item) && !empty($item['date'])) {
                            $mmDates[] = is_numeric($item['date']) ? $item['date'] : strtotime($item['date']);
                        }
                    }
                    $mmLastDate = !empty($mmDates) ? max($mmDates) : null;
                    $mmDateText = $mmLastDate ? \common\helpers\DateHelper::showDate($mmLastDate, 'dd.MM.YYYY') : '';

                    // Проверяем флаг отображения 7-дневного уровня (settings_saf.show_7gunluk)
                    $show7 = false;
                    try {
                        $rows = Yii::$app->db->createCommand('SELECT * FROM settings_saf')->queryAll();
                        foreach ($rows as $row) {
                            if (isset($row['key']) && $row['key'] === 'show_7gunluk' && (int)$row['value'] === 1) {
                                $show7 = true;
                                break;
                            }
                        }
                    } catch (\Throwable $e) {
                        // В случае отсутствия таблицы/ошибки — тихо игнорируем, оставляем $show7 = false
                    }

                    // Подсчёт "орта gəlirlilik" как среднего из доступных уровней (7/28/84/168/252)
                    $levelKeys = ['notsLevels7','notsLevels28','notsLevels84','notsLevels168','notsLevels252'];
                    $levelVals = [];
                    foreach ($levelKeys as $k) {
                        if (!empty($mmData[$k]['value'])) {
                            $v = str_replace('%', '', $mmData[$k]['value']);
                            // Заменяем запятую на точку для float
                            $v = str_replace(',', '.', $v);
                            if (is_numeric($v)) {
                                $levelVals[] = (float)$v;
                            }
                        }
                    }
                    $avgYield = count($levelVals) ? number_format(array_sum($levelVals)/count($levelVals), 2, ',', '') . '%' : '—';

                    // Переводы для заголовков берём так же, как в виджете MoneyMarketBlockWidget
                    $notsVolumeLabel = \visitor\helpers\HtmlHelper::getValueFromArray(Yii::t('other', 'infolines'), 'nots_volume');
                ?>
                <div class="widget collapsible-widget">
                    <h3><?= Yii::t('app', 'Money-Market') ?></h3>
                    <div class="widget-content">
                        <p class="widget-date" style="margin-bottom: 55px!important"><?= Yii::t('app', 'From {date}', ['date' => $mmDateText]) ?></p>

                        <div>
                            <a href="<?= Url::to(['info-blocks/index', 'alias' => 'nots_volume']) ?>" class="stat-row">
                                <span><?= Yii::t('app', 'In-circulation') ?></span>
                                <strong><?= !empty($mmData['notsVolume']['value']) ? $mmData['notsVolume']['value'] : '—' ?> <?= Yii::t('app', 'mln-AZN') ?></strong>
                            </a>
                        </div>

                        <div class="notes-grid">
                            <? if ($show7): ?>
                                <a href="<?= Url::to(['info-blocks/index', 'alias' => 'nots_levels_7']) ?>"><?= Yii::t('app', '7-days') ?> <strong><?= !empty($mmData['notsLevels7']['value']) ? $mmData['notsLevels7']['value'] : '—' ?></strong></a>
                            <? endif; ?>
                            <a href="<?= Url::to(['info-blocks/index', 'alias' => 'nots_levels_28']) ?>"><?= Yii::t('app', '28-days') ?> <strong><?= !empty($mmData['notsLevels28']['value']) ? $mmData['notsLevels28']['value'] : '—' ?></strong></a>
                            <a href="<?= Url::to(['info-blocks/index', 'alias' => 'nots_levels_84']) ?>"><?= Yii::t('app', '84-days') ?> <strong><?= !empty($mmData['notsLevels84']['value']) ? $mmData['notsLevels84']['value'] : '—' ?></strong></a>
                            <a href="<?= Url::to(['info-blocks/index', 'alias' => 'nots_levels_168']) ?>"><?= Yii::t('app', '168-days') ?> <strong><?= !empty($mmData['notsLevels168']['value']) ? $mmData['notsLevels168']['value'] : '—' ?></strong></a>
                            <a href="<?= Url::to(['info-blocks/index', 'alias' => 'nots_levels_252']) ?>"><?= Yii::t('app', '252-days') ?> <strong><?= !empty($mmData['notsLevels252']['value']) ? $mmData['notsLevels252']['value'] : '—' ?></strong></a>
                        </div>
                    </div>
                </div>

                <!-- BLOCK J -->
                <?php
                    // Получаем данные для кривой доходности (Gəlirlilik əyrisi)
                    $ycDays = \common\models\YCPeriods::find()->all();
                    $ycDay = null;
                    $ycData = [];
                    if (!empty($ycDays)) {
                        // Сортируем дни
                        usort($ycDays, function ($a, $b) {
                            return strtotime($b->date) - strtotime($a->date);
                        });
                        $ycDay = $ycDays[0]->date;
                        $ycYieldsArray = \common\models\YCYields::find()->where(['date' => $ycDay])->all();
                        foreach ($ycYieldsArray as $yield) {
                            $ycData[] = [$yield->date, $yield->period, $yield->profitability];
                        }
                    }
                ?>
                <div class="widget collapsible-widget">
                    <h3><?= Yii::t('app', 'Gəlirlilik əyrisi') ?></h3>
                    <div class="widget-content">
                        <div class="graph-placeholder" id="yieldCurveChart" style="height: 200px; border: none; background: transparent; overflow: hidden;">
                            <svg style="width: 100%; height: 100%;"></svg>
                        </div>
                        <a href="<?= Url::to(['home/chart', 'language' => Yii::$app->language]) ?>" class="btn-primary-outline"><?= Yii::t('app', 'Gəlirlilik əyrisi Daha Cox') ?></a>
                    </div>
                </div>


                <!-- BLOCK K -->
                <div class="widget collapsible-widget">
                    <h3><? echo Yii::t('app', 'Banking-Sector') ?></h3>
                    <div class="widget-content">
                        <?
                        $bankCredit = \common\models\InfoLines::getLastValueByAlias('bank_credit');
                        $bankNation = \common\models\InfoLines::getLastValueByAlias('bank_nation');
                        $bankDate = \common\helpers\DateHelper::showDate($bankCredit['date'], 'dd.MM.Y');
                        $infolineLabels = Yii::t('other', 'infolines');
                        ?>
                        <p class="widget-date"><?= Yii::t('app', 'From {date}', ['date' => $bankDate]) ?></p>

                        <a href="<?= Url::to(['info-blocks/index', 'alias' => 'bank_credit']) ?>" class="stat-row">
                            <span><?= \visitor\helpers\HtmlHelper::getValueFromArray($infolineLabels, 'bank_credit') ?></span>
                            <strong><?= $bankCredit['value'] ?></strong>
                        </a>

                        <a href="<?= Url::to(['info-blocks/index', 'alias' => 'bank_nation']) ?>" class="stat-row">
                            <span><?= \visitor\helpers\HtmlHelper::getValueFromArray($infolineLabels, 'bank_nation') ?></span>
                            <strong><?= $bankNation['value'] ?></strong>
                        </a>
                    </div>
                </div>

            </div>
        </div>

    </div>
</section>

<link rel="stylesheet" href="/yield_excel/css/nv.css">
<script src="/yield_excel/js/d3v3.js"></script>
<script src="/yield_excel/js/nvd3.js"></script>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Табы
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                this.classList.add('active');
                const target = document.getElementById(this.dataset.tab);
                if (target) {
                    target.classList.add('active');
                }
            });
        });

        // Видео
        // Мы используем LightGallery через класс videogallery, который инициализирован в init.js
        // Поэтому здесь JS обработчик для .video-card не требуется, 
        // но если нужно кастомное поведение, его можно добавить здесь.

        // Sidebar Collapsible Widgets (Mobile only)
        document.querySelectorAll('.collapsible-widget h3').forEach(header => {
            header.addEventListener('click', function() {
                if (window.innerWidth <= 1100) {
                    const widget = this.parentElement;
                    widget.classList.toggle('active');
                    
                    // Fix for Yield Curve chart (BLOCK J) when expanding
                    if (widget.classList.contains('active') && typeof chart !== 'undefined') {
                        setTimeout(function() {
                            chart.update();
                        }, 300); // Wait for potential CSS transitions
                    }
                }
            });
        });

        // График кривой доходности
        var ycArr = <?= json_encode($ycData) ?>;
        var ycDay = '<?= $ycDay ?>';
        var chart; // Declare chart in a scope accessible to the collapsible logic

        if (ycArr.length > 0 && typeof nv !== 'undefined' && typeof d3 !== 'undefined') {
            nv.addGraph(function() {
                chart = nv.models.lineChart()
                    .showLegend(false)
                    .useInteractiveGuideline(true)
                    .forceY([0, 16])
                    .forceX([0, 1800]);

                var daysLabels = { 
                    90: "<?= Yii::t('app', '3 ay') ?>",
                    365: "<?= Yii::t('app', '1 il') ?>",
                    730: "<?= Yii::t('app', '2 il') ?>", 
                    1096: "<?= Yii::t('app', '3 il') ?>",
                    1460: "<?= Yii::t('app', '4 il') ?>",
                    1800: "<?= Yii::t('app', '5 il') ?>"
                };

                chart.xAxis.tickValues([90, 365, 730, 1096, 1460, 1800])
                    .tickFormat(function(d) {
                        if (d === 0) return "";
                        return daysLabels[d] || d;
                    });

                chart.yAxis.tickFormat(function(d) {
                    return d === 0 ? "0" : d3.format('.1f')(d);
                });

                var chartData = [{
                    values: ycArr.map(function(d) { return {x: parseFloat(d[1]), y: parseFloat(d[2])}; }),
                    key: ycDay,
                    color: '#4BC7B5'
                }];

                d3.select('#yieldCurveChart svg')
                    .datum(chartData)
                    .call(chart);

                nv.utils.windowResize(chart.update);
                return chart;
            });
        }
    });

    function toggleInfoPopup(event) {
        event.stopPropagation();
        var popup = document.getElementById('azir-info-popup');
        if (popup) {
            popup.classList.toggle('show');
        }
    }

    document.addEventListener('click', function(event) {
        var popup = document.getElementById('azir-info-popup');
        if (popup && popup.classList.contains('show')) {
            if (!popup.contains(event.target) && !event.target.classList.contains('info-icon')) {
                popup.classList.remove('show');
            }
        }
    });
    document.addEventListener("DOMContentLoaded", function () {
        const grid = document.querySelector(".cbar-publications-grid");
        const dotsContainer = document.querySelector(".cbar-publications-pagination");
        
        if (!grid || !dotsContainer) return;

        function updateDots() {
            const items = grid.querySelectorAll(".cbar-publication-item");
            if (items.length === 0) return;

            const scrollWidth = grid.scrollWidth;
            const clientWidth = grid.clientWidth;
            const maxScrollLeft = scrollWidth - clientWidth;
            
            if (maxScrollLeft <= 1) {
                dotsContainer.style.display = 'none';
                return;
            } else {
                dotsContainer.style.display = 'flex';
            }

            // Рассчитываем количество слайдов на основе того, сколько раз мы можем прокрутить по clientWidth до maxScrollLeft
            const numSlides = Math.max(1, Math.ceil(maxScrollLeft / clientWidth) + 1);
            
            // Очищаем и пересоздаем точки, если их количество изменилось
            const currentDotsCount = dotsContainer.querySelectorAll(".cbar-dot").length;
            if (currentDotsCount !== numSlides) {
                dotsContainer.innerHTML = "";
                for (let i = 0; i < numSlides; i++) {
                    const dot = document.createElement("span");
                    dot.className = "cbar-dot" + (i === 0 ? " active" : "");
                    dot.dataset.index = i;
                    dot.addEventListener("click", () => {
                        let scrollPos = i * clientWidth;
                        // Не позволяем прокручивать дальше максимума
                        if (scrollPos > maxScrollLeft) scrollPos = maxScrollLeft;
                        
                        grid.scrollTo({
                            left: scrollPos,
                            behavior: 'smooth'
                        });
                    });
                    dotsContainer.appendChild(dot);
                }
            }

            // Обновляем активную точку на основе текущего скролла
            // Используем maxScrollLeft для корректного определения последней точки
            let activeIndex = Math.round(grid.scrollLeft / clientWidth);
            if (grid.scrollLeft >= maxScrollLeft - 5) {
                activeIndex = numSlides - 1;
            }
            const dots = dotsContainer.querySelectorAll(".cbar-dot");
            dots.forEach((dot, i) => {
                dot.classList.toggle("active", i === activeIndex);
            });
        }

        grid.addEventListener("scroll", updateDots);
        window.addEventListener("resize", () => {
            // При ресайзе количество слайдов может измениться, поэтому принудительно перерисовываем
            dotsContainer.innerHTML = ""; 
            updateDots();
        });
        
        // Начальная инициализация
        setTimeout(updateDots, 100);
        window.addEventListener("load", updateDots);
    });

    document.addEventListener("DOMContentLoaded", function () {
        const grid = document.querySelector(".cbar-links-grid");
        const dotsContainer = document.querySelector(".cbar-links-pagination");
        
        if (!grid || !dotsContainer) return;

        function updateDots() {
            const items = grid.querySelectorAll(".cbar-link-card");
            if (items.length === 0) return;

            const scrollWidth = grid.scrollWidth;
            const clientWidth = grid.clientWidth;
            const maxScrollLeft = scrollWidth - clientWidth;
            
            if (maxScrollLeft <= 1) {
                dotsContainer.style.display = 'none';
                return;
            } else {
                dotsContainer.style.display = 'flex';
            }

            const numSlides = Math.max(1, Math.ceil(maxScrollLeft / clientWidth) + 1);
            
            const currentDotsCount = dotsContainer.querySelectorAll(".cbar-dot").length;
            if (currentDotsCount !== numSlides) {
                dotsContainer.innerHTML = "";
                for (let i = 0; i < numSlides; i++) {
                    const dot = document.createElement("span");
                    dot.className = "cbar-dot" + (i === 0 ? " active" : "");
                    dot.dataset.index = i;
                    dot.addEventListener("click", () => {
                        let scrollPos = i * clientWidth;
                        if (scrollPos > maxScrollLeft) scrollPos = maxScrollLeft;

                        grid.scrollTo({
                            left: scrollPos,
                            behavior: 'smooth'
                        });
                    });
                    dotsContainer.appendChild(dot);
                }
            }

            let activeIndex = Math.round(grid.scrollLeft / clientWidth);
            if (grid.scrollLeft >= maxScrollLeft - 5) {
                activeIndex = numSlides - 1;
            }
            const dots = dotsContainer.querySelectorAll(".cbar-dot");
            dots.forEach((dot, i) => {
                dot.classList.toggle("active", i === activeIndex);
            });
        }

        grid.addEventListener("scroll", updateDots);
        window.addEventListener("resize", () => {
            dotsContainer.innerHTML = ""; 
            updateDots();
        });
        
        setTimeout(updateDots, 100);
        window.addEventListener("load", updateDots);
    });
</script>

<section class="cbar-wrapper">
    <div class="container">
        <!-- ===== SECTION 1 ===== -->
        <div class="cbar-section-top">

        <!-- LEFT BLOCK -->
            <div class="cbar-publications">
                <h2><?= Yii::t('app', 'publications-and-researches') ?></h2>

                <div class="cbar-publications-slider">
                    <div class="cbar-publications-grid">
                        <?
                        $publications = \common\models\HomepagePublications::getAllPublications();
                        foreach ($publications as $pub):
                            $title = $pub['title_' . Yii::$app->language];
                            $url = \yii\helpers\Url::to($pub['url_' . Yii::$app->language]);
                            $image = Yii::$app->params['uploadsUrl'] . '/homepage_publications/' . $pub['icon_' . Yii::$app->language];
                            ?>
                            <a href="<?= $url ?>" class="cbar-publication-item" target="_blank">
                                <div class="cbar-publication-image">
                                    <img src="<?= $image ?>" alt="<?= $title ?>">
                                </div>
                                <h3><?= $title ?></h3>
                                <? if ($pub['date_publication']): ?>
                                    <span class="cbar-publication-date"><?= Yii::$app->formatter->asDate($pub['date_publication'], 'php:j F Y') ?></span>
                                <? endif; ?>
                            </a>
                        <? endforeach; ?>
                    </div>
                    <!-- BULLETS FOR MOBILE -->
                    <div class="cbar-publications-pagination">
                    </div>
                </div>
            </div>


        <!-- RIGHT BLOCK -->
            <div class="cbar-quick-links">
                <h2><?= Yii::t('app', 'fast-track') ?></h2>

                <ul>
                    <?
                    $links = \common\models\HomepageLinks::getAllLinks();
                    foreach ($links as $link): ?>
                        <li>
                            <a href="<?= \yii\helpers\Url::to($link['url_' . Yii::$app->language]) ?>" target="_blank">
                                <?= $link['title_' . Yii::$app->language] ?> <span>→</span>
                            </a>
                        </li>
                    <? endforeach; ?>
                </ul>
            </div>

    </div>



    <!-- ===== SECTION 2 ===== -->
    <div class="cbar-section-bottom">
        <h2><?= Yii::t('footer', 'usefull-links') ?></h2>

        <div class="cbar-links-slider">
            <div class="cbar-links-grid">
                <?
                $banners = \common\models\Banners::getAllBanners();
                foreach ($banners as $banner):
                    $title = $banner['title_' . Yii::$app->language];
                    $url = \yii\helpers\Url::to($banner['url']);
                    $domain = parse_url($banner['url'], PHP_URL_HOST);
                    ?>
                    <a href="<?= $url ?>" class="cbar-link-card" target="_blank">
                        <h3><?= $title ?></h3>
                        <? if ($domain): ?>
                            <span><?= $domain ?></span>
                        <? endif; ?>
                    </a>
                <? endforeach; ?>
            </div>
            <!-- BULLETS FOR MOBILE -->
            <div class="cbar-links-pagination">
            </div>
        </div>
    </div>
</section>

