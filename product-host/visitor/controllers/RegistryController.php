<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\controllers;

use visitor\helpers\RegistryHelper;
use visitor\providers\ApiDataProvider;
use visitor\viewmodels\RegistryViewModel;
use yii\base\Module;

class RegistryController extends MainController
{

    private $apiDataProvider;
    private $registryViewModel;

    public function __construct($id, Module $module, ApiDataProvider $apiDataProvider, RegistryViewModel $registryViewModel, array $config = [])
    {
        parent::__construct($id, $module, $config);
        $this->apiDataProvider = $apiDataProvider;
        $this->registryViewModel = $registryViewModel;
    }

    private $actions = [
        'banks' => [
            'title' => 'Banklar',
            'apiKey' => 'registryBank',
            'downloadKey' => 'registryBankDownload',
            'view' => 'banks',
        ],
        'bokts' => [
            'title' => 'Bank olmayan kredit təşkilatları',
            'apiKey' => 'registryBokt',
            'downloadKey' => 'registryBoktDownload',
            'view' => 'bokts',
        ],
        'creditUnions' => [
            'title' => 'Kredit ittifaqları',
            'apiKey' => 'registryCreditUnion',
            'downloadKey' => 'registryCreditUnionDownload',
            'view' => 'credit-unions',
        ],
        'investmentCompanies' => [
            'title' => 'İnvestisiya şirkətləri',
            'apiKey' => 'registryInvestmentCompanies',
            'downloadKey' => 'registryInvestmentCompaniesDownload',
            'view' => 'investment-companies',
        ],
        'stockMarkets' => [
            'title' => 'Fond birjası',
            'apiKey' => 'registryStockMarkets',
            'downloadKey' => 'registryStockMarketsDownload',
            'view' => 'stock-markets',
        ],
        'clearingOrganizations' => [
            'title' => 'Klirinq təşkilatı',
            'apiKey' => 'registryClearingOrganizations',
            'downloadKey' => 'registryClearingOrganizationsDownload',
            'view' => 'clearing-organizations',
        ],
        'depositaries' => [
            'title' => 'Mərkəzi depozitar',
            'apiKey' => 'registryDepositaries',
            'downloadKey' => 'registryDepositariesDownload',
            'view' => 'depositaries',
        ],
        'investmentFunds' => [
            'title' => 'İnvestisiya fondları və onların idarəçiləri',
            'apiKey' => 'registryInvestmentFunds',
            'downloadKey' => 'registryInvestmentFundsDownload',
            'view' => 'investment-funds',
        ],
        'insurances' => [
            'title' => 'Sığortaçılar və təkrarsığortaçılar',
            'apiKey' => 'registryInsurances',
            'downloadKey' => 'registryInsurancesDownload',
            'view' => 'insurances',
        ],
        'insurance-intermediaries' => [
            'title' => 'Sığorta vasitəçiləri',
            'apiKey' => 'registryInsuranceIntermediaries',
            'view' => 'insurance-intermediaries',
        ],
        'subsidiary-and-experts' => [
            'title' => 'Sığorta sahəsində yardımçı hüquqi şəxslər və müstəqil ekspertlər',
            'apiKey' => 'registrySubsidiary',
            'downloadKey' => 'registrySubsidiaryDownload',
            'view' => 'subsidiary-and-experts',
        ],
        'foreign-insurers' => [
            'title' => 'Xarici sığorta brokerləri',
            'apiKey' => 'registryForeignInsurers',
            'downloadKey' => 'registryForeignInsurersDownload',
            'view' => 'foreign-insurers',
        ],
        'actuaries' => [
            'title' => 'Aktuarilər',
            'apiKey' => 'registryActuaries',
            'downloadKey' => 'registryActuariesDownload',
            'view' => 'actuaries',
        ],
        'posts' => [
            'title' => 'Poçt rabitəsinin milli operatoru',
            'apiKey' => 'registryPosts',
            'downloadKey' => 'registryPostsDownload',
            'view' => 'posts',
        ],
        'currencies' => [
            'title' => 'Valyuta mübadiləsi məntəqələri',
            'apiKey' => 'registryCurrencies',
            'downloadKey' => 'registryCurrenciesDownload',
            'view' => 'currencies',
        ],


    ];

    //TODO Refactor/temp
    public function actionDownload($endpoint)
    {

        if ($endpoint == 'individual-agents') {
            $apiUrl = 'https://api-registry-public.e-cbar.az/api/OutToPublicXLSX/individual-agents-export-as-excell';
            $fileDesc = 'Fiziki şəxs olan sığorta agenti';
        } elseif ($endpoint == 'individual-brokers') {
            $apiUrl = 'https://api-registry-public.e-cbar.az/api/OutToPublicXLSX/individual-brokers-export-as-excell';
            $fileDesc = 'Fiziki şəxs olan sığorta brokerləri';
        } elseif ($endpoint == 'legal-agents') {
            $apiUrl = 'https://api-registry-public.e-cbar.az/api/OutToPublicXLSX/legal-agents-export-as-excell';
            $fileDesc = 'Hüquqi şəxs olan sığorta agentləri';
        } elseif ($endpoint == 'legal-brokers') {
            $apiUrl = 'https://api-registry-public.e-cbar.az/api/OutToPublicXLSX/legal-agents-export-as-excell';
            $fileDesc = 'Hüquqi şəxs olan sığorta brokerləri';
        } elseif ($endpoint == 'foreign-banks') {
            $apiUrl = 'https://api-registry-public.e-cbar.az/api/OutToPublicXLSX/legal-agents-export-as-excell';
            $fileDesc = 'Foreign Banks';
        } elseif ($endpoint == 'bank-branches') {
            $apiUrl = 'https://api-registry-public.e-cbar.az/api/OutToPublicXLSX/banks-branches-export-as-excell';
            $fileDesc = 'Bank branches';
        }else {
            return $this->redirect(['home/index']);
        }


        $data = $this->apiDataProvider->downloadFile($apiUrl);
        header('Content-type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="' . $fileDesc . '.xlsx"');
        return $data;
    }


    private function handleDownloadAction($apiUrl, $category)
    {
        $data = $this->apiDataProvider->downloadFile($apiUrl);
        header('Content-type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="' . $category . '.xlsx"');
        return $data;
    }

    private function handleDataAction($apiUrl, $view)
    {
        $data = $this->apiDataProvider->fetchData($apiUrl);
        return $this->render($view, ['data' => $data, 'registryViewModel' => $this->registryViewModel]);
    }

    public function actionIndex()
    {
        return $this->render('index', ['actions' => $this->actions]);
    }

    public function actionDetail($category, $download = 0)
    {

        if (!array_key_exists($category, $this->actions)) {
            return $this->redirect(['home/index']);
        }

        $actionInfo = $this->actions[$category];
        $apiUrl = ($download == 1) ? RegistryHelper::getApiUrl($actionInfo['downloadKey']) : RegistryHelper::getApiUrl($actionInfo['apiKey']);
        return ($download == 1) ? $this->handleDownloadAction($apiUrl, $category) : $this->handleDataAction($apiUrl, $actionInfo['view']);
    }

}