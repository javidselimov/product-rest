<?

use yii\helpers\Url;
use common\components\identity\UserIdentity;
use admin\widgets\InfoLinesMenuWidget;
?>
<div class="left side-menu">
    <div class="sidebar-inner slimscrollleft">
        <div id="sidebar-menu">
            <ul>
                <li class="menu-title">Navigation</li>
                <li><a href="/" class="waves-effect"><i class="mdi mdi-home"></i><span><? echo Yii::t('app', 'Home-Page') ?></span></a></li>
                <? if (Yii::$app->user->identity->role == UserIdentity::ADMIN_ROLE): ?>
                    <li><a href="<? echo Url::to(['/users']) ?>" class="waves-effect"><i class="mdi mdi-human-greeting"></i><span><? echo Yii::t('app', 'Users') ?></span></a></li>
                <? endif; ?>
                <li><a href="<? echo Url::to(['/videos-streams/index']) ?>" class="waves-effect"><i class="mdi mdi-message-video"></i><span><? echo Yii::t('app', 'Videos Streams') ?></span></a></li>
                <li><a href="<? echo Url::to(['/currency/rates']) ?>" class="waves-effect"><i class="mdi mdi-currency-usd"></i><span><? echo Yii::t('app', 'Currency-Rates') ?></span></a></li>
                <li><a href="<? echo Url::to(['/azir/index']) ?>" class="waves-effect"><i class="mdi mdi-currency-usd"></i><span><? echo Yii::t('app', 'AZIR INDEX') ?></span></a></li>
                <li><a href="<? echo Url::to(['/yield-curve/index']) ?>" class="waves-effect"><i class="mdi mdi-currency-usd"></i><span><? echo Yii::t('app', 'YC YIELDS') ?></span></a></li>
                <li><a href="<? echo Url::to(['/yield-curve/parametrs']) ?>" class="waves-effect"><i class="mdi mdi-currency-usd"></i><span><? echo Yii::t('app', 'YC PARAMETRS') ?></span></a></li>
                <li><a href="<? echo Url::to(['/yield-curve/periods']) ?>" class="waves-effect"><i class="mdi mdi-currency-usd"></i><span><? echo Yii::t('app', 'YC PERIODS') ?></span></a></li>
                <li><a href="<? echo Url::to(['/press-releases/question']) ?>" class="waves-effect"><i class="mdi mdi-currency-usd"></i><span><? echo Yii::t('app', 'Press Reliz Question') ?></span></a></li>
                <li><a href="<? echo Url::to(['/homepage-links/index']) ?>" class="waves-effect"><i class="mdi mdi-domain"></i><span><? echo Yii::t('app', 'Homepage-Links') ?></span></a></li>
                <li><a href="<? echo Url::to(['/homepage-publications/index']) ?>" class="waves-effect"><i class="mdi mdi-book"></i><span><? echo Yii::t('app', 'Publications') ?></span></a></li>
                <li><a href="<? echo Url::to(['/banners/index']) ?>" class="waves-effect"><i class="mdi mdi-tag-multiple"></i><span><? echo Yii::t('app', 'Banners') ?></span></a></li>
                <li><a href="<? echo Url::to(['/pages/index']) ?>" class="waves-effect"><i class="mdi mdi-book-open-variant"></i><span><? echo Yii::t('app', 'Pages') ?></span></a></li>
                <li><a href="<? echo Url::to(['/press-releases/index', 'type' => '1']) ?>" class="waves-effect"><i class="mdi mdi-newspaper"></i><span><? echo Yii::t('app', 'Press-Releases') ?></span></a></li>
                <li><a href="<? echo Url::to(['/press-releases/index', 'type' => '2']) ?>" class="waves-effect"><i class="mdi mdi-newspaper"></i><span><? echo Yii::t('app', 'Announcements') ?></span></a></li>
                <li class="has_sub">
                    <a href="javascript:void(0);" class="waves-effect"><i class="mdi mdi-bookmark"></i>Milli pul nişanları <span class="menu-arrow"></span></a>
                    <ul class="list-unstyled">
                        <li><a href="<? echo Url::to(['/moneymarks/categories/index']) ?>">Məzmun</a></li>
                        <li><a href="<? echo Url::to(['/moneymarks/news/index']) ?>">Xəbərlər</a></li>
                    </ul>
                </li>
                <li><a href="<? echo Url::to(['/gallery/default/index']) ?>" class="waves-effect"><i class="mdi mdi-image"></i><span><? echo Yii::t('app', 'Photo-Gallery') ?></span></a></li>
                <li><a href="<? echo Url::to(['/videos/index']) ?>" class="waves-effect"><i class="mdi mdi-video"></i><span><? echo Yii::t('app', 'Video-Gallery') ?></span></a></li>
                <li class="has_sub">
                    <a href="javascript:void(0);" class="waves-effect"><i class="mdi mdi-bank"></i>Mərkəzi Bank <span class="menu-arrow"></span></a>
                    <ul class="list-unstyled">
                        <li><a href="<? echo Url::to(['/organization/staff/index', 'type' => '1']) ?>">İdarə Heyəti</a></li>
                        <li><a href="<? echo Url::to(['/organization/staff/index', 'type' => '2']) ?>">Rəhbərlik</a></li>
                        <li><a href="<? echo Url::to(['/organization/divisions/index']) ?>">Struktur bölmələr</a></li>
                        <li><a href="<? echo Url::to(['/organization/offices/index']) ?>">Ərazi idarələr</a></li>
                    </ul>
                </li>
                <li class="has_sub">
                    <a href="javascript:void(0);" class="waves-effect"><i class="mdi mdi-buffer"></i>MEAS <span class="menu-arrow"></span></a>
                    <ul class="list-unstyled">
                        <li><a href="<? echo Url::to(['/meas/default/index']) ?>">MEAS</a></li>
                        <li><a href="<? echo Url::to(['/meas/emitent/index']) ?>">Emitentlər</a></li>
                        <li><a href="<? echo Url::to(['/meas/info-type/index']) ?>">Məlumatın növləri</a></li>
                    </ul>
                </li>
                <li><a href="<? echo Url::to(['/news-slider/index']) ?>" class="waves-effect"><i class="mdi mdi-image-multiple"></i><span><? echo Yii::t('app', 'News-Slider') ?></span></a></li>
                <li><a href="<? echo Url::to(['/running-line/index']) ?>" class="waves-effect"><i class="mdi mdi-format-textdirection-l-to-r"></i><span><? echo Yii::t('app', 'Running Line') ?></span></a></li>
                <li><a href="<? echo Url::to(['/monthly-inflation/index']) ?>" class="waves-effect"><i class="mdi mdi-trending-up"></i><span><? echo Yii::t('app', 'Monthly Inflation') ?></span></a></li>
                <li class="has_sub">
                    <a href="javascript:void(0);" class="waves-effect"><i class="mdi mdi-information-outline"></i>İnformativ bloklar <span class="menu-arrow"></span></a>
                    <? echo InfoLinesMenuWidget::widget() ?>
                </li>
                <li><a href="<? echo Url::to(['/laws/categories/index']) ?>" class="waves-effect"><i class="mdi mdi-hangouts"></i><span><? echo Yii::t('app', 'Laws-Page') ?></span></a></li>
            </ul>
        </div>
        <div class="clearfix"></div>
        <div class="help-box hidden-xs">
            <h5 class="text-muted m-t-0"><? echo Yii::t('app', 'Contacts') ?></h5>
            <p class=""><span class="text-white"><b>Email:</b></span> <br/> <? echo Yii::$app->params['adminEmail'] ?></p>
            <p class="m-b-0"><span class="text-white"><b><? echo Yii::t('app', 'Phone') ?>:</b></span> <br/> <? echo Yii::$app->params['adminPhone'] ?></p>
        </div>
    </div>
</div>
