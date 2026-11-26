<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace app\controllers;

use yii\console\Controller;

class MarketActorsController extends Controller
{

    private function getEndpoint()
    {
        return 'https://api-license-registry.e-cbar.az';
    }

    private static function getToken()
    {
        return 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjJjNWFhYjU1LTQwMmEtNDQ3NC05Zjk2LWY2NWEyMTBhZjM2ZSIsImp0aSI6ImRiMTdiZDZjLTkxODMtNGMwMC05Y2ZmLTE5ZjIxNWRiMWU4YiIsIm5iZiI6MTY2NTQ0NzkzNywiZXhwIjoxNjY1NDQ4MjM3LCJpYXQiOjE2NjU0NDc5Mzd9.3rkhg9D_B7oi9QLd9hSd6GQCpbtPpKbHxnxZ7wTqHahSgt_FUtRICJIBiyY0g1nqlaLJw9rBrxysFqfW2H_dyQ';
    }

    private function getList()
    {
        return [
            'bokt-list' => 'bokt-list-export-as-excell',
            'bank-list' => 'bank-list-export-as-excell',
            'individual-agent-list' => 'individual-agent-list-export-as-excell ',
            'individual-broker-list' => 'individual-broker-list-export-as-excell ',
            'legal-broker-list' => 'legal-broker-list-export-as-excell ',
            'legal-agent-list' => 'legal-agent-list-export-as-excell',
            'investment-management-list' => 'investment-managment-list-export-as-excell',
            'security-list' => 'security-list-export-as-excell',
            'subsidiary-list' => 'subsidiary-list-export-as-excell',
            'legal-expert-list' => 'legal-expert-list-export-as-excell',
            'individual-expert-list' => 'individual-expert-list-export-as-excell',
            'insurance-list' => 'insurance-list-export-as-excell',
            'currency-list' => 'currency-list-export-as-excell',
            'post-list' => 'pocht-list-export-as-excell',
            'foreign-insurance-list' => 'foreign-insurance-list-export-as-excell',
        ];
    }


    public function actionRun()
    {
        $endPoint = $this->getEndpoint();
        $list = $this->getList();

        foreach ($list as $key => $value) {

            $outputFile = 'common/web/uploads/market-actors/' . $key . '.xlsx';
            $downloadUrl = $endPoint . '/api/OutToPublic/' . $value;

            $ch = curl_init();
            $out = fopen($outputFile, 'wb');
            curl_setopt($ch, CURLOPT_HTTPHEADER, array(
                'Connection: keep-alive',
                'Accept: */*',
                'Content-Length: 0',
                'Content-Type: application/json',
                'Authorization: Bearer ' . self::getToken()
            ));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FILE, $out);
            curl_setopt($ch, CURLOPT_URL, $downloadUrl);
            curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
            curl_setopt($ch, CURLOPT_POST, 1);
            //For testing
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
            $output = curl_exec($ch);
            fwrite($out, $output);

            if (curl_exec($ch) === false) {
                echo 'Curl error: ' . curl_error($ch);
            } else {
                echo $key . ' done!', PHP_EOL;
            }
            if (curl_errno($ch)) {
                echo 'Curl error: ' . curl_error($ch);
            }
            curl_close($ch);

        }

        echo 'Parsing finished.';
    }
}
