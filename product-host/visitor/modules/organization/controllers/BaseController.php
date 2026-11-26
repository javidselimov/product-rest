<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\modules\organization\controllers;

use visitor\controllers\MainController;
use visitor\modules\organization\viewmodels\OrganizationViewModel;

class BaseController extends MainController
{

    public $organizationViewModel;

    public function __construct(string $id, \yii\base\Module $module, array $config = [], OrganizationViewModel $organizationViewModel)
    {
        $this->organizationViewModel = $organizationViewModel;
        parent::__construct($id, $module, $config);
    }

}
