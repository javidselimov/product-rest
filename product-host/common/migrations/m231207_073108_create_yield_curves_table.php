<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%yield_curves}}`.
 */
class m231207_073108_create_yield_curves_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%yield_curves}}', [
            'id' => $this->primaryKey(),
            'date' => $this->date(),
            'file_name' => $this->string(),
            'parametr_file' => $this->string(),
            'yield_file_name' => $this->string(),
            'created_at' => $this->string(),
            'updated_at' => $this->timestamp(),
        ]);








        $connection = Yii::$app->db;
        $command = $connection->createCommand("
         INSERT INTO yield_curves (date, file_name, parametr_file, yield_file_name, created_at, updated_at) 
         VALUES ('2023-12-11', '17022817126576c1f0c32fe.xlsx','17022817126576c1f0c348c.xlsx','17022817126576c1f0c3585.xlsx','2023-12-07 12:00:00','2023-12-07 12:00:00');

        ");

        $command->execute();

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('{{%yield_curves}}');
    }
}
