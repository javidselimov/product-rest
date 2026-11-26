<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\helpers;

use Yii;
use yii\helpers\Html;

class FileHelper
{

    public static function checkAssetLanguage($asset)
    {
        $language = Yii::$app->language;
        $field = 'filename_' . $language;

        if (is_array($asset)) {
            if (isset($asset['filename_az']) && isset($asset['filename_en'])) {
                return !empty($asset[$field]) ? $asset[$field] : $asset['filename_az'];
            }
            return isset($asset['filename_az']) ? $asset['filename_az'] : '';
        } else {
            if (isset($asset->filename_az) && isset($asset->filename_en)) {
                return !empty($asset->$field) ? $asset->$field : $asset->filename_az;
            }
            return isset($asset->filename_az) ? $asset->filename_az : '';
        }
    }

    public static function getRemoteFileSize($fileName = null, string $fileFolder = "assets")
    {
        if (empty($fileName)) {
            return '';
        }
        $uploadsFolder = Yii::getAlias(Yii::$app->params['uploadsDirectory']);
        $file = $uploadsFolder . '/' . $fileFolder . '/' . $fileName;
        if (file_exists($file)) {
            $filesize = filesize($file);
            return Yii::$app->formatter->asShortSize($filesize, 2);
        }
    }

    public static function getFileExtension($filename = null)
    {
        if (empty($filename)) {
            return '';
        }
        $fileParams = pathinfo($filename);
        return $fileParams['extension'];
    }

    public static function showAssetImageIcon($filename = null, array $params = [], string $folder = 'assets')
    {
        if (empty($filename)) {
            return '';
        }
        $fileParams = pathinfo($filename);
        $imagesPath = Yii::$app->params['uploadsUrl'] . '/' . $folder . '/';
        $iconsPath = '/images/icons/';

        $extension = isset($fileParams['extension']) ? strtolower($fileParams['extension']) : '';

        if (self::isImage($extension)) {
            return Html::img($imagesPath . $filename, $params);
        } elseif (!empty($extension)) {
            return Html::img($iconsPath . $extension . '.svg', $params);
        } else {
            return '';
        }
    }

    public static function isImage($extension)
    {
        return in_array(strtolower($extension), ['jpg', 'jpeg', 'png', 'gif']);
    }

    public static function getFirstImage($assets, $language = null)
    {
        if (empty($assets)) {
            return null;
        }

        $language = $language ?: Yii::$app->language;
        $field = 'filename_' . $language;

        foreach ($assets as $asset) {
            if (is_array($asset)) {
                $filename = isset($asset[$field]) ? $asset[$field] : null;
                if (empty($filename) && $language !== 'az') {
                    $filename = isset($asset['filename_az']) ? $asset['filename_az'] : null;
                }
            } else {
                $filename = isset($asset->$field) ? $asset->$field : null;
                if (empty($filename) && $language !== 'az') {
                    $filename = isset($asset->filename_az) ? $asset->filename_az : null;
                }
            }

            if (!empty($filename)) {
                $ext = pathinfo($filename, PATHINFO_EXTENSION);
                if (self::isImage($ext)) {
                    return $filename;
                }
            }
        }
        return null;
    }

    public static function checkAssetType($asset)
    {
        if (is_array($asset)) {
            $filenameAz = isset($asset['filename_az']) ? $asset['filename_az'] : null;
            $filenameEn = isset($asset['filename_en']) ? $asset['filename_en'] : null;
        } else {
            $filenameAz = isset($asset->filename_az) ? $asset->filename_az : null;
            $filenameEn = isset($asset->filename_en) ? $asset->filename_en : null;
        }

        if (empty($filenameAz)) {
            return false;
        }

        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        $detectedType = \yii\helpers\FileHelper::getMimeTypeByExtension($filenameAz);

        if ((in_array($detectedType, $allowedTypes) and empty($filenameEn)) or
            (Yii::$app->language == 'en' and $filenameEn) or (Yii::$app->language == 'az' and $filenameAz)
        ) {
            return true;
        }
        return false;
    }

}