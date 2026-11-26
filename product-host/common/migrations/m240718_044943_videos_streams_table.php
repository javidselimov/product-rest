<?php

use yii\db\Migration;

class m240718_044943_videos_streams_table extends Migration
{
    const TABLE_NAME = '{{%videos_streams}}';

    public function up()
    {
        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'creator_id' => $this->integer(),
            'url' => $this->string(),
            'date' => $this->date()->notNull(),
            'title_az' => $this->string()->notNull(),
            'title_en' => $this->string()->notNull(),
            'active' => $this->smallInteger()->defaultValue(1),
            'slug' => $this->string()->notNull(),
            'created_at' => $this->timestamp(),
            'updated_at' => $this->timestamp(),
        ]);

        $this->addForeignKey(
            'fk-videos_streams-creator_id',
            'videos_streams',
            'creator_id',
            'users',
            'id',
            'CASCADE'
        );
    }

    public function down()
    {
        $this->dropTable(self::TABLE_NAME);
    }
}