# Data Model: Audit qeydində uzun User-Agent

**Sxem dəyişikliyi yoxdur.** Migration yoxdur, `Cbar.Domain` (hər iki kopya) toxunulmur.
Aşağıda yalnız iştirak edən sahələr və onlara yeni tətbiq olunan qayda var.

## `audit_log` (`0001-initial-schema.sql:86`) — `AuditLogEntry`

| Sahə | Tip | Mənbə | Bu feature-də |
|---|---|---|---|
| `user_agent` | `varchar(500)`, nullable | `User-Agent` sorğu başlığı | **Yazmadan əvvəl kəsilir** (qayda aşağıda) |
| `actor_id`, `action`, `entity_type`, `entity_id`, `before`, `after`, `ip`, `created_at` | — | kod / token / bağlantı | Dəyişmir (FR-004) |

## `admin_refresh_tokens` (`0004`) — `RefreshToken`

| Sahə | Tip | Bu feature-də |
|---|---|---|
| `user_agent` | `varchar(500)`, nullable | Artıq kəsilir; eyni köməkçiyə keçir → R3 düzəlişi buraya da gəlir |

## Kəsmə qaydası (hər iki sahə üçün eyni — FR-001, FR-003)

Giriş: sorğunun `User-Agent` başlıq(lar)ı, bugünkü kimi bir sətrə birləşdirilmiş.

1. `HttpContext` yoxdur → `null`.
2. Başlıq yoxdur → `""` (bugünkü kimi).
3. Uzunluq ≤ 500 → dəyişmədən.
4. Uzunluq > 500 → ilk 500 vahid; 500-cü vahid surrogate cütünün ilk yarısıdırsa, ilk 499
   (research R3). Nəticə həmişə etibarlı mətndir və sütuna sığır.

Vəziyyət keçidi yoxdur — qayda yazma anında bir dəfə tətbiq olunur, saxlanmış qeydlər
dəyişmir (onsuz da 500-dən uzun qeyd mövcud ola bilməz: belə yazma geri qaytarılırdı).
