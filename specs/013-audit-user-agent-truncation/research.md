# Research: Audit qeydində uzun User-Agent

Spec-də `NEEDS CLARIFICATION` yoxdur. Aşağıdakılar kodu oxuyarkən çıxan dizayn sualları və
onların cavablarıdır.

## R1 — Uğursuzluğun mexanizmi və əhatəsi

**Tapıntı**: `AuditService.Log` (`Services/AuditService.cs:29`) `Request.Headers.UserAgent`-i
olduğu kimi `AuditLogEntry.UserAgent`-ə yazır. EF modelində (`CbarDbContext.cs:115`) bu
sahəyə `HasMaxLength` yoxdur, ona görə EF heç nə yoxlamır; `audit_log.user_agent varchar(500)`
(`0001-initial-schema.sql:95`) isə PostgreSQL-də `22001 value too long` atır. Audit qeydi
çağıranın `SaveChangesAsync`-i ilə eyni tranzaksiyada gedir → əsas dəyişiklik də geri qaytarılır,
klient 500 alır.

**Əhatə**: `AuditService.Log` çağıran 27 controller-in hamısı, o cümlədən
`AuthController` (`auth.login` :72, `auth.logout` :175). Yəni uzun UA ilə **login də
uğursuzdur** — review bunu "hər save" kimi qeyd edib, amma girişin özü də sınır.

**Digər `user_agent` sütunları**: `admin_refresh_tokens` (0004; `RefreshToken` entity-si buraya map olunur, `CbarDbContext.cs:103`) — `RefreshTokenService.cs:198`
artıq kəsir. Köhnə `refresh_tokens` (0001) və `user_sessions` — kodda bu cədvəllərə yazan yer yoxdur (grep: yalnız iki
`UserAgent =` təyinatı var). Əlavə iş yoxdur.

## R2 — Hədd harada tətbiq olunur

**Decision**: Kəsmə **yazma nöqtəsində**, `AuditService.Log`-da, eyni qayda ilə
`RefreshTokenService.NewRow`-da. Qayda bir kiçik statik köməkçidə yaşayır
(`Services/ClientUserAgent.cs`: `MaxLength = 500` + kəsmə), hər iki servis onu çağırır.

**Rationale**: FR-003 iki qeydin eyni dəyəri saxlamasını tələb edir. İki yerdə əl ilə yazılmış
`[..500]` bu gün eynidir, amma R3-dəki düzəliş birinə edilib digərinə unudulsa, ayrılırlar.
Bir köməkçi bunu struktur olaraq təmin edir; 011-dəki `PasswordHashing.WorkFactor` ilə eyni
yanaşmadır. Xərci: bir yeni fayl, ~15 sətir.

**Alternatives considered**:
- *Yalnız `AuditService.cs:29`-da bir sətir* (review-un təklifi). Ən kiçik dəyişiklik, amma
  R3-ü ya iki yerdə təkrarlamaq, ya da `RefreshTokenService`-i köhnə qayda ilə saxlamaq
  deməkdir. Rədd edildi — fərq 1 SP daxilindədir.
- *EF-də `HasMaxLength(500)`*: EF bunu yazmada yoxlamır/kəsmir, yalnız sxem metadata-sıdır.
  Üstəlik `Cbar.Domain`-ə toxunur → iki kopyanı dəyişmək lazım gəlir (Maddə V.1). Rədd edildi.
- *Sütunu `text`-ə çevirmək (migration)*: klientin idarə etdiyi dəyərin hədsiz saxlanması;
  hər iki `Cbar.Domain` və migration lazım olur. Spec Assumptions-da rədd edilib.
- *Audit-i ayrıca tranzaksiyaya çıxarmaq*: audit bilərəkdən əsas dəyişikliklə atomikdir
  (Maddə III.4); bu, böyük dizayn dəyişikliyidir və bu task-ın əhatəsindən kənardır.

## R3 — Surrogate cütünün yarıdan kəsilməsi

**Tapıntı**: C#-da `string.Length` UTF-16 kod vahidlərini sayır, PostgreSQL `varchar(500)` isə
simvolları (code point). Kod vahidlərinin sayı həmişə ≥ code point sayı olduğundan 500 vahidə
kəsilmiş sətir sütuna **həmişə sığır** — uzunluq baxımından bugünkü `RefreshTokenService` qaydası
düzgündür.

Risk başqa yerdədir: 500-cü vahid BMP-dən kənar simvolun (emoji və s.) ilk yarısıdırsa,
`[..500]` tək qalmış high surrogate saxlayır. Bu etibarlı UTF-16 deyil; Npgsql sətri UTF-8-ə
çevirəndə ciddi (strict) encoder istifadə edir və belə sətirdə xəta ata bilər — yəni yenə 500.
Kestrel default olaraq başlıqları ASCII, alınmasa UTF-8 kimi decode edir, ona görə klient
bu vəziyyəti bilərəkdən yarada bilər.

**Decision**: Kəsmə nöqtəsində 500-cü vahid high surrogate-dirsə, 499-da kəsilir. Nəticə
həmişə etibarlı mətndir (spec Edge Cases). Bu, `RefreshTokenService`-ə də R2-dəki köməkçi
vasitəsilə gəlir.

**Doğrulama**: Npgsql davranışı burada ölçülmədən iddia olunur — quickstart §3 bunu
`test`-də 499 ASCII + emoji UA ilə yoxlayır (köməkçidən əvvəl `admin_refresh_tokens` yolunda
xəta gözlənilir, sonra yox). Npgsql xəta atmasa belə, düzəliş zərərsizdir: etibarsız mətn
saxlanmamalıdır.

## R4 — Boş və yoxluq halları

**Decision**: Bugünkü davranış saxlanılır. `HttpContext` yoxdursa (`AuditService`-də
`http?.`) → `null`. Başlıq yoxdursa → `StringValues.Empty.ToString()` = `""`. Bir neçə
`User-Agent` başlığı göndərilibsə, `StringValues.ToString()` onları vergüllə birləşdirir —
birləşmiş sətir kəsilir.

## R5 — Kəsilmə barədə log/xəbərdarlıq

**Decision**: Yoxdur (spec Assumptions). UA klientin etibar olunmayan məlumatıdır; ilk 500
simvol araşdırma üçün kifayətdir, hər uzun UA-da log sətri isə log flood vektoru olardı.

## R6 — Hansı ölçüdə UA tətbiqə çatır

Ingress (nginx) default `large_client_header_buffers 4 8k` ilə ~8 KB-dan uzun başlıq sətrini
özü 400 ilə rədd edir; Kestrel-in default ümumi başlıq limiti 32 KB-dır. Yəni tətbiqə çatan UA
praktikada < 8 KB-dır. Quickstart 501, 1000 və 4000 simvolla yoxlayır (SC-001); 8 KB+ halı
spec-də əhatədən kənardır. Ingress parametri DevOps tərəfindədir (`TODO(devops)`), ona görə
dəqiq hədd test zamanı müşahidə olunur, iddia edilmir.

## R7 — Verification yolu

Lokalda .NET SDK yoxdur (Konstitusiya VIII.1 sapması, 011/012 ilə eyni). Build GitLab
pipeline-ında, yoxlama `test` mühitində `curl -A` ilə. Admin API-də audit jurnalını oxuyan
endpoint **yoxdur**, ona görə SC-002/SC-004 (saxlanan dəyər) `test` bazasında SELECT tələb
edir. Bu girişin olub-olmaması DevOps-dan asılıdır; yoxdursa, SC-001 (status kodları) +
kod review ilə kifayətlənilir və bu MR təsvirində qeyd olunur.
