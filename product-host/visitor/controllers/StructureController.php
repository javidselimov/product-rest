<?php

namespace visitor\controllers;

class StructureController extends MainController
{
    public function actionIndex()
    {
        $this->view->title = \Yii::t('app', 'Structure');
        return $this->render('index');
    }
}
