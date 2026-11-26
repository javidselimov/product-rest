<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace common\components\filesystem;

use League\Flysystem\Filesystem;
use League\Flysystem\Sftp\SftpAdapter;
use yii\helpers\FileHelper;

class SFTP
{

    public static function deleteFolders(array $folders)
    {
        foreach ($folders as $folder) {
            FileHelper::removeDirectory($folder, ['traverseSymlinks' => true]);
            if (!file_exists($folder)) {
                mkdir($folder, 0777, true);
            }
        }
    }

    public static function deleteFilesFromFolders(array $config, array $folders)
    {
        $adapter = new SftpAdapter($config);
        $filesystem = new Filesystem($adapter);
        foreach ($folders as $folder) {
            $contents = $filesystem->listContents($folder, 'true');
            foreach ($contents as $object) {
                if ($object['basename'] != '.gitignore') {
                    $filesystem->deleteDir($object['path']);
                }
            }
        }
    }
}