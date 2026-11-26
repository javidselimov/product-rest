<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180306_071526_create_organization_staff_table extends Migration
{

    const TABLE_NAME = '{{%organization_staff}}';

    public function up()
    {
        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'creator_id' => $this->integer(),
            'name' => $this->string()->notNull(),
            'job' => $this->string()->notNull(),
            'type' => $this->smallInteger()->notNull(),
            'position' => $this->smallInteger()->notNull()->defaultValue(1),
            'phone' => $this->string()->notNull(),
            'photo' => $this->string()->notNull(),
            'about_az' => $this->text()->notNull(),
            'about_en' => $this->text()->notNull(),
            'reception_days' => $this->string()->notNull(),
            'active' => $this->smallInteger()->defaultValue(1),
            'created_at' => $this->timestamp(),
            'updated_at' => $this->timestamp(),
        ]);

        $this->addForeignKey(
            'fk-organization_staff-creator_id',
            'organization_staff',
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