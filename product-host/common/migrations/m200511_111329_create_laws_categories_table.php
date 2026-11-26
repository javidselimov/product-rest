<?php

use yii\db\Migration;

class m200511_111329_create_laws_categories_table extends Migration
{
    const TABLE_NAME = '{{%laws_categories}}';

    public function up()
    {
        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'creator_id' => $this->integer(),
            'title_az' => $this->string()->notNull(),
            'title_en' => $this->string()->notNull(),
            'created_at' => $this->timestamp(),
            'updated_at' => $this->timestamp(),
        ]);


        $this->addForeignKey(
            'fk-laws_categories-creator_id',
            'laws_categories',
            'creator_id',
            'users',
            'id',
            'NO ACTION'
        );
    }

    public function down()
    {
        $this->dropTable(self::TABLE_NAME);
    }
}
