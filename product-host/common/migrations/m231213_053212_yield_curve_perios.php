<?php

use yii\db\Migration;

/**
 * Class m231213_053212_yield_curve_perios
 */
class m231213_053212_yield_curve_perios extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%yield_curve_periods}}', [
            'id' => $this->primaryKey(),
            'date' => $this->date(),
            'three_month' => $this->string(),
            'six_month' => $this->string(),
            'nine_month' => $this->string(),
            'one_year' => $this->string(),
            'two_year' => $this->string(),
            'three_year' => $this->string(),
            'four_year' => $this->string(),
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('{{%yield_curve_periods}}');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m231213_053212_yield_curve_perios cannot be reverted.\n";

        return false;
    }
    */
}
