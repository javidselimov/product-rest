<?php

namespace common\components\qradar;

use Yii;

class QradarLogger
{
    public static function log($title, $description, $email = null, $extraData = [])
    {
        // Специальная подмена заголовка при активации/деактивации
        if (isset($extraData['Status']))
        {
            if ($extraData['Status'] === 'ACTIVATED')
                $title = 'USER WAS ENABLED';
            elseif ($extraData['Status'] === 'DEACTIVATED')
                $title = 'USER WAS DISABLED';
        }

        $userInfo = self::extractUserInfo($email);
        $fullDescription = self::buildFullDescription($description, $extraData);
        $updatedAttributes = self::extractChangedAttributes($extraData);
        $logMessage = self::buildLogMessage($title, $fullDescription, $updatedAttributes, $userInfo);

        Yii::info($logMessage, 'qradar'); //for local testing qradar-test, for server qradar
    }

    private static function extractUserInfo($email)
    {
        $userId = 'unknown';
        $username = 'unknown';

        if ($email === null && isset(Yii::$app->user) && Yii::$app->user->identity) {
            $identity = Yii::$app->user->identity;
            $userId   = isset($identity->id) ? $identity->id : $userId;
            $username = isset($identity->username) ? $identity->username : $username;
            $email    = isset($identity->email) ? $identity->email : 'unknown';
        }

        return [
            'userId' => $userId,
            'username' => $username,
            'email' => $email,
        ];
    }

    private static function buildFullDescription($description, $extraData)
    {
        if (empty($extraData)) {
            return $description;
        }

        $details = '';
        foreach ($extraData as $key => $value) {
            $details .= $key . ": " . $value . "; ";
        }

        return $description . ' ' . trim($details);
    }

    private static function extractChangedAttributes($extraData)
    {
        foreach ($extraData as $value) {
            if (is_string($value) && (strpos($value, 'changed') !== false || strpos($value, 'was changed') !== false)) {
                return QradarDescriptionBuilder::buildChangedAttributesString($extraData);
            }
        }

        return null;
    }

    private static function buildLogMessage($title, $fullDescription, $updatedAttributes, $userInfo)
    {
        $request = Yii::$app->request;

        $log = " Title: " . $title;

        if ($updatedAttributes) {
            $log .= " Updated attribute: " . $updatedAttributes;
        }

        $log .= " Description: " . $fullDescription;
        $log .= " ip: " . $request->userIP;
        $log .= " User-Agent: " . $request->userAgent;
        $log .= " UserId: " . $userInfo['userId'];
        $log .= " Username: " . $userInfo['username'];
        $log .= " Email: " . $userInfo['email'] . PHP_EOL;

        return $log;
    }
}
