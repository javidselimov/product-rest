<?php

namespace common\components\qradar;

class QradarDescriptionBuilder
{
    const ROLE_ADMIN     = 1;
    const ROLE_MODERATOR = 2;
    const ROLE_MANAGER   = 3;

    private static $roles = [
        self::ROLE_ADMIN     => "ADMIN_ROLE",
        self::ROLE_MODERATOR => "MODERATOR_ROLE",
        self::ROLE_MANAGER   => "MEAS_MANAGER_ROLE",
    ];

    public static function build($type, $model)
    {
        switch ($type) {
            case 'activation':
                return self::buildActivationData($model);
            case 'edit':
                return self::buildEditData($model);
            case 'profile':
                return self::buildProfileData($model);
            case 'create':
                return self::buildCreateData($model);
            default:
                return [];
        }
    }

    private static function buildCreateData($model)
    {
        // Если передан массив атрибутов
        if (is_array($model)) {
            return [
                'Username' => $model['username'] ?? '',
                'Email'    => $model['email'] ?? '',
                'Role'     => isset(self::$roles[$model['role'] ?? null]) ? self::$roles[$model['role']] : ($model['role'] ?? ''),
                'Activity' => ($model['active'] ?? null) == 1 ? 'ACTIVE' : 'DEACTIVE',
                'Avatar'   => $model['avatar'] ?? '',
            ];
        }
        // Если передана модель
        return [
            'Username' => $model->username,
            'Email'    => $model->email,
            'Role'     => isset(self::$roles[$model->role]) ? self::$roles[$model->role] : $model->role,
            'Activity' => ($model->active == 1) ? 'ACTIVE' : 'DEACTIVE',
            'Avatar'   => $model->avatar,
        ];
    }

    private static function buildActivationData($model)
    {
        return [
            'Status'   => ($model->active == 1) ? 'ACTIVATED' : 'DEACTIVATED',
            'Username' => $model->username,
            'Email'    => $model->email,
            'UserID'   => $model->id,
            'Role'     => isset(self::$roles[$model->role]) ? self::$roles[$model->role] : $model->role,
        ];
    }

    private static function buildEditData($model)
    {
        return [
            'Username' => $model->username,
            'Email'    => $model->email,
            'UserID'   => $model->id,
            'Role'     => isset(self::$roles[$model->role]) ? self::$roles[$model->role] : $model->role,
            'Password' => $model->password,
            'Activity' => ($model->active == 1) ? 'ACTIVE' : 'DEACTIVE',
            'Avatar'   => $model->avatar,
            //'ExpireAt' => $model->expire_at,
        ];
    }

    private static function buildProfileData($model)
    {
        return [
            'Username' => $model->username,
            'Email'    => $model->email,
            'UserID'   => $model->id,
            'Password' => $model->password,
            'Avatar'   => $model->avatar,
        ];
    }

    public static function getChangedAttributesForLog($old, $new)
    {
        $diff = [];

        foreach ($new as $key => $value) {
            if (!array_key_exists($key, $old)) {
                continue;
            }

            if ($old[$key] != $value) {
                if ($key === 'password') {
                    $diff[$key] = 'was changed';
                } elseif ($key === 'role') {
                    $oldRole = isset(self::$roles[$old[$key]]) ? self::$roles[$old[$key]] : $old[$key];
                    $newRole = isset(self::$roles[$value]) ? self::$roles[$value] : $value;
                    $diff[$key] = "changed from '{$oldRole}' to '{$newRole}'";
                } else {
                    $diff[$key] = "changed from '{$old[$key]}' to '{$value}'";
                }
            }
        }

        return $diff;
    }

    public static function buildChangedAttributesString($diff)
    {
        if (empty($diff)) {
            return '';
        }

        $changes = [];
        foreach ($diff as $attr => $desc) {
            $changes[] = $attr . " change";
        }

        return implode('; ', $changes) . ';';
    }
}
