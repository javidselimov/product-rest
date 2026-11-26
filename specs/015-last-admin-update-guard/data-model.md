# Data Model: son aktiv admin qoruması

Sxem, entity və migration dəyişikliyi **yoxdur**. Bu sənəd yalnız qaydanın istifadə etdiyi
mövcud sahələri və keçidləri təsvir edir.

## Mövcud sahələr

| Entity | Sahə | Rolu |
|---|---|---|
| `User` (`users`) | `IsActive` | aktivlik |
| | `RoleId` → `Role.Code` | `admin` / `moderator` / `meas_manager` |
| | `DeletedAt` | soft-delete; query filter ilə gizlənir |
| | `LockedUntil` | müvəqqəti login kilidi (spec 012) — qaydaya təsir etmir |

## "Aktiv admin" tərifi

`IsActive == true && Role.Code == "admin" && DeletedAt == null`. Silmə və redaktə eyni tərifi
istifadə edir (FR-004). Kilidlənmiş hesab aktiv admin sayılır.

## Redaktə keçidləri (hədəf → sorğu)

| Hədəfin cari vəziyyəti | Sorğu | Başqa aktiv admin var | Yoxdur |
|---|---|---|---|
| aktiv admin | `isActive=false` | 200, sessiyalar ləğv | **409**, heç nə dəyişmir |
| aktiv admin | admin olmayan `roleId` | 200 | **409**, heç nə dəyişmir |
| aktiv admin | hər ikisi | 200, sessiyalar ləğv | **409**, heç nə dəyişmir |
| aktiv admin | yalnız email (rol admin, aktiv) | 200 | 200 |
| deaktiv admin | istənilən | 200 | 200 |
| admin olmayan | admin rolu və/və ya aktivləşdirmə | 200 | 200 |

Prioritet: 400 (email/rol) → 404 → 409 (email məşğul) → 409 (son admin).

## Silmə (dəyişmir)

özünü silmə → 409; son aktiv admin → 409 "Cannot delete the last active administrator."; əks halda 204.
