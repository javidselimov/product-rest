# Data Model: Admin API-də qlobal xəta idarəsi

**Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md)

Sxem, migration və `Cbar.Domain` **dəyişmir**. Bu sənəd yeni cavab modelini və xəritə
cədvəllərini təsvir edir; persistent məlumat yoxdur.

## 1. Xəta cavabı (problem details)

Tam kontrakt: [contracts/error-response.md](./contracts/error-response.md).

| Sahə | Tip | Qayda |
|---|---|---|
| `type` | string (URI/URN) | həmişə; DB-xəritəli hallarda `urn:cbar:problem:<növ>` |
| `title` | string? | 401/403/5xx-də `message` yoxdursa **yoxdur** (R5) |
| `status` | int | HTTP status ilə eyni |
| `detail` | string? | `message` varsa onunla eyni; 5xx-də ümumi mətn |
| `traceId` | string | həmişə |
| `message` | string? | keçid sahəsi; bugünkü mətn |
| `code` | enum? | `refresh_missing` \| `refresh_stale` \| `refresh_invalid` \| `refresh_reused` \| `refresh_expired` \| `origin_forbidden` — bugünkü dəyərlər, yenisi yoxdur |
| `errors` | map<string, string[]>? | binding 400; username/email 409 |
| `field`, `locale` | string? | slug 409 |
| `mimeType` | string? | preview 415 |

**İnvariantlar**

- `detail` və `message` eyni anda varsa, mətnləri eynidir.
- Heç bir sahədə SQL, məhdudiyyət/cədvəl/sütun adı, istisna mətni və ya stack trace yoxdur.
- `code` yalnız yuxarıdakı üç dəyəri alır.

## 2. DB xəta sinfi → cavab

`PostgresException.SqlState` + HTTP metod + `ConstraintName` → (status, `type`, `message`,
əlavə sahələr). Cədvəl: [contracts/error-response.md §DB xətası → cavab](./contracts/error-response.md#db-xətası--cavab).

Qərar sırası:

1. Sorğu müştəri tərəfindən kəsilib (`RequestAborted` + `OperationCanceledException`/`IOException`)
   → 499, gövdə yoxdur, Debug logu.
2. İstisna zəncirində `PostgresException` yoxdur → handler `false` (daxili 500 yolu).
3. `SqlState` cədvəldə yoxdur → `false`.
4. `23505`: əvvəl məhdudiyyət xəritəsi (§3), tapılmasa ümumi 409.
5. `23503`: metod `DELETE` → 409 reference-in-use; əks halda `*_locale_fkey` → "Unknown locale.",
   qalanları → "A referenced item does not exist." (400).
6. `22001`/`22003`/`23502`/`23514` → 400, növə uyğun mətn.
7. Warning logu: `SqlState`, `ConstraintName`, `TableName`, status, metod, path (traceId
   log kontekstindən).

## 3. Məlum unikal məhdudiyyətlər

| Məhdudiyyət (ad qaydası) | Cədvəllər | Cavab |
|---|---|---|
| `<t>_locale_slug_key` | `page_translations`, `press_release_translations`, `law_translations`, `money_mark_translations`, `money_mark_news_translations` | 409, `field: "slug"`, `locale` birmənalıdırsa |
| `users_username_key` | `users` | 409, `errors.Username` |
| `users_email_key` | `users` | 409, `errors.Email`; mətn metoddan asılı |
| `media_assets_storage_key_key` | `media_assets` | qlobal handler-ə çatmır — upload-da lokal tutulur, 200 (R7) |

Ad qaydası suffix ilə yoxlanılır (`EndsWith("_locale_slug_key")`), cədvəl siyahısı sabit
yazılmır — yeni slug-lı tərcümə cədvəli əlavə ediləndə avtomatik əhatə olunur. Adlar `test`
bazasında `pg_constraint`-dən təsdiqlənir ([quickstart.md §0](./quickstart.md)).

**`locale` necə tapılır**: `DbUpdateException.Entries` içində `ConstraintName`-in cədvəlinə
uyğun entity-lərin `Locale` property-si; hamısı eyni dəyərdirsə — o, əks halda sahə buraxılır.

## 4. Media upload axtarışı (R7)

```text
checksum → media_assets WHERE checksum_sha256 = :checksum (soft-delete filtri olmadan)
         → ORDER BY (deleted_at IS NOT NULL), id
         → ilk qeyd
```

Vəziyyətlər:

| Tapılan | Nəticə |
|---|---|
| canlı qeyd | 200, həmin qeyd (bugünkü kimi) |
| yalnız silinmiş qeyd | bərpa + `media.restore` auditi, 200 (bugünkü kimi) |
| heç nə | anbara yaz → insert; `media_assets_storage_key_key` pozuntusu olsa → izləyicini təmizlə → axtarışı təkrarla → yuxarıdakı iki sətir |
