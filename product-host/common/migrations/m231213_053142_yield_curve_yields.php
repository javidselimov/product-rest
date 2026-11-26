<?php

use yii\db\Migration;

/**
 * Class m231213_053142_yield_curve_yields
 */
class m231213_053142_yield_curve_yields extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {

        $this->createTable('{{%yield_curve_yields}}', [
            'id' => $this->primaryKey(),
            'date' => $this->date(),
            'period' => $this->string(),
            'profitability' => $this->string(),
        ]);

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('{{%yield_curve_yields}}');
    }

}
