<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180713_054651_drop_not_null_organization_divisions_filename_column extends Migration
{
    const TABLE_NAME = '{{%organization_divisions}}';

    public function up()
    {
        $this->execute('ALTER TABLE "public"."organization_divisions" ALTER COLUMN "filename" DROP NOT NULL;');
    }

    public function down()
    {
        $this->execute('ALTER TABLE "public"."organization_divisions" ALTER COLUMN "filename" SET NOT NULL;');
    }
}