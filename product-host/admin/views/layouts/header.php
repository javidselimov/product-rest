<?

use yii\helpers\Url;
use admin\helpers\ButtonsHelper;
?>
<div class="topbar">
    <div class="topbar-left">
        <a href="/" class="logo"><span>Cbar-<span>Admin</span></span><i class="mdi mdi-layers"></i></a>
    </div>
    <div class="navbar navbar-default" role="navigation">
        <div class="container">
            <ul class="nav navbar-nav navbar-left">
                <li>
                    <button class="button-menu-mobile open-left waves-effect">
                        <i class="mdi mdi-menu"></i>
                    </button>
                </li>
            </ul>
            <ul class="nav navbar-nav navbar-right">
                <li class="dropdown user-box">
                    <a href="" class="dropdown-toggle waves-effect user-link" data-toggle="dropdown" aria-expanded="true">
                        <img src="<? echo Yii::$app->params['uploadsUrl'] ?>/avatars/<? echo Yii::$app->user->identity->avatar ?>" class="img-circle user-img">
                    </a>
                    <ul class="dropdown-menu dropdown-menu-ri arrow-dropdown-menu arrow-menu-right user-list notify-list">
                        <li><h5><? echo Yii::$app->user->identity->username ?></h5></li>
                        <li><a href="<? echo Url::to(['users/profile']) ?>"><i class="mdi mdi-account-card-details m-r-5"></i><? echo Yii::t('app', 'Profile') ?></a></li>
                        <li><? echo ButtonsHelper::exitButton() ?></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</div>