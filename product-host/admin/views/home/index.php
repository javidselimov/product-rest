<?

use yii\helpers\Url;

$this->title = 'Ana səhifə';
?>
<a class="btn btn-success waves-effect w-md waves-light m-b-5" href="<? echo Url::to(['home/clean-cache']) ?>">Очистить кэш проекта</a><hr>
<a class="btn btn-danger waves-effect w-md waves-light m-b-5" href="<? echo Url::to(['home/index-search']) ?>">Обновить кэш поиска</a>
