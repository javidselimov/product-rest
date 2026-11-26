<?php

use yii\db\Migration;

/**
 * Handles adding footer_visible to table `{{%pages}}`.
 */
class m220815_071020_add_footer_visible_column_to_pages_table extends Migration
{
    const TABLE_NAME = '{{%pages}}';

    public function up()
    {
        $this->addColumn(self::TABLE_NAME, 'show_footer', $this->boolean()->notNull()->defaultValue(false));
    }

    public function down()
    {
        $this->dropColumn(self::TABLE_NAME, 'show_footer');
    }
}