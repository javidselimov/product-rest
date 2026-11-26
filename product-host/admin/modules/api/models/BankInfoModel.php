<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace admin\modules\api\models;

use yii\base\Model;
use yii\web\UploadedFile;

class BankInfoModel extends Model
{
    /**
     * @var UploadedFile[]
     */
    public $xmlFiles;

    public function rules()
    {
        return [
            [['xmlFiles'], 'file', 'skipOnEmpty' => false, 'extensions' => 'xml', 'mimeTypes' => 'application/xml, text/xml', 'maxFiles' => 3, 'maxSize' => 1024 * 1024 * 3],
        ];
    }
}