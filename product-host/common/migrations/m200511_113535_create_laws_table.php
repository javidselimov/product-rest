<?php

use yii\db\Migration;


class m200511_113535_create_laws_table extends Migration
{
    const TABLE_NAME = '{{%laws}}';

    public function up()
    {
        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'creator_id' => $this->integer(),
            'category_id' => $this->integer()->notNull(),
            'type' => $this->integer()->notNull(),
            'title_az' => $this->string()->notNull(),
            'title_en' => $this->string()->notNull(),
            'description_az' => $this->text()->notNull(),
            'description_en' => $this->text()->notNull(),
            'slug' => $this->string()->notNull(),
            'active' => $this->smallInteger()->notNull(),
            'created_at' => $this->timestamp(),
            'updated_at' => $this->timestamp(),
        ]);

        $this->addForeignKey(
            'fk-laws-creator_id',
            'laws',
            'creator_id',
            'users',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-laws-category_id',
            'laws',
            'category_id',
            'laws_categories',
            'id',
            'CASCADE'
        );
    }

    public function down()
    {
        $this->dropTable(self::TABLE_NAME);
    }
}
