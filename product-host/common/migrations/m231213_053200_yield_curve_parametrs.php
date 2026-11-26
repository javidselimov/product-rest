<?php

use yii\db\Migration;

/**
 * Class m231213_053200_yield_curve_parametrs
 */
class m231213_053200_yield_curve_parametrs extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%yield_curve_parametrs}}', [
            'id' => $this->primaryKey(),
            'date' => $this->date(),
            'beta_0' => $this->string(),
            'beta_1' => $this->string(),
            'beta_2' => $this->string(),
            'lambda' => $this->string(),
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('{{%yield_curve_parametrs}}');
    }
    
}
