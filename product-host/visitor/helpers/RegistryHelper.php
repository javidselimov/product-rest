<?php

namespace visitor\helpers;

use Yii;

class RegistryHelper
{

    public static function getApiUrl($key)
    {
        $env = Yii::$app->params['projectVersion'];

        $urlList = [
            'test' => [
                'registryBank' => 'https://api-registry-public.e-cbar.az/api/OutToPublic/banks',
                'registryBankDownload' => 'https://api-registry-public.e-cbar.az/api/OutToPublicXLSX/banks-export-as-excell',
                'registryBokt' => 'https://api-registry-public.e-cbar.az/api/OutToPublic/bokts',
                'registryBoktDownload' => 'https://api-registry-public.e-cbar.az/api/OutToPublicXLSX/bokts-export-as-excell',
                'registryCreditUnion' => 'https://api-registry-public.e-cbar.az/api/OutToPublic/credit-unions',
                'registryCreditUnionDownload' => 'https://api-registry-public.e-cbar.az/api/OutToPublicXLSX/credit-unions-export-as-excell',
                'registryInvestmentCompanies' => 'https://api-registry-public.e-cbar.az/api/OutToPublic/investment-companies',
                'registryInvestmentCompaniesDownload' => 'https://api-registry-public.e-cbar.az/api/OutToPublicXLSX/investment-companies-export-as-excell',
                'registryStockMarkets' => 'https://api-registry-public.e-cbar.az/api/OutToPublic/stock-exchange',
                'registryStockMarketsDownload' => 'https://api-registry-public.e-cbar.az/api/OutToPublicXLSX/stock-exchange-export-as-excell',
                'registryClearingOrganizations' => 'https://api-registry-public.e-cbar.az/api/OutToPublic/clearing-organizations',
                'registryClearingOrganizationsDownload' => 'https://api-registry-public.e-cbar.az/api/OutToPublicXLSX/clearing-organizations-export-as-excell',
                'registryDepositaries' => 'https://api-registry-public.e-cbar.az/api/OutToPublic/depositaries',
                'registryDepositariesDownload' => 'https://api-registry-public.e-cbar.az/api/OutToPublicXLSX/depositaries-export-as-excell',
                'registryInvestmentFunds' => 'https://api-registry-public.e-cbar.az/api/OutToPublic/investmentFunds-and-managers',
                'registryInvestmentFundsDownload' => 'https://api-registry-public.e-cbar.az/api/OutToPublicXLSX/investment-managments-export-as-excell',
                'registryInsurances' => 'https://api-registry-public.e-cbar.az/api/OutToPublic/insurances',
                'registryInsurancesDownload' => 'https://api-registry-public.e-cbar.az/api/OutToPublicXLSX/insurances-export-as-excell',
                'registryInsuranceIntermediaries' => 'https://api-registry-public.e-cbar.az/api/OutToPublic/insurance-intermediaries',
                'registrySubsidiary' => 'https://api-registry-public.e-cbar.az/api/OutToPublic/subsidiary-and-experts',
                'registrySubsidiaryDownload' => 'https://api-registry-public.e-cbar.az/api/OutToPublicXLSX/subsidiaries-experts-export-as-excell',
                'registryForeignInsurers' => 'https://api-registry-public.e-cbar.az/api/OutToPublic/foreign-insurers',
                'registryForeignInsurersDownload' => 'https://api-registry-public.e-cbar.az/api/OutToPublicXLSX/foreign-insurances-export-as-excell',
                'registryActuaries' => 'https://api-registry-public.e-cbar.az/api/OutToPublic/actuaries',
                'registryActuariesDownload' => 'https://api-registry-public.e-cbar.az/api/OutToPublicXLSX/actuaries-export-as-excell',
                'registryPosts' => 'https://api-registry-public.e-cbar.az/api/OutToPublic/pochts',
                'registryPostsDownload' => 'https://api-registry-public.e-cbar.az/api/OutToPublicXLSX/pochts-export-as-excell',
                'registryCurrencies' => 'https://api-registry-public.e-cbar.az/api/OutToPublic/currencies',
                'registryCurrenciesDownload' => 'https://api-registry-public.e-cbar.az/api/OutToPublicXLSX/currencies-export-as-excell',
            ],
            'prod' => [
                'registryBank' => 'https://api-registry-public.e-cbar.az/api/OutToPublic/banks',
                'registryBankDownload' => 'https://api-registry-public.e-cbar.az/api/OutToPublicXLSX/banks-export-as-excell',
            ],
        ];

        return $urlList[$env][$key];
    }


    public static function printField($label, $value)
    {
        if ($label !== null) {
            $html = '<tr>';
            $html .= '<td>' . $label . '</td>';
            $html .= '<td>' . strip_tags($value) . '</td>';
            $html .= '</tr>';
            echo $html;
        }
    }

    public static function printContact($type, $value)
    {
        if ($type !== null) {
            echo ' - ' . $type . ': ' . strip_tags($value) . '<br>';
        }
    }
}