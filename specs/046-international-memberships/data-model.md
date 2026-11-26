# Data model — spec 046

Sxem dəyişikliyi **yoxdur**. Yeni cədvəl, sütun, entity və ya endpoint yoxdur; `Cbar.Domain` dəyişmir.

## 1. Saxlanılan məlumat

| Nə | Harada | Qeyd |
|---|---|---|
| Üzvlük cədvəli | `page_translations.content` (səhifə 554, hər dil ayrıca) | Redaktorun `<table>`-ı; qayda [contracts/cms-markup.md](./contracts/cms-markup.md) |
| Menyu qruplarının açıq/bağlı vəziyyəti | `useUiStore.openNavGroups` (persist, mövcud açar `nexus-ui`) | Hər brauzer üçün ayrı; itərsə standart vəziyyət |

## 2. Sayt view-modeli (`web-cbar-new`, `features/about-content/model/types.ts`)

```text
AboutLayoutKind += 'memberships'

Membership            { organization: string; href: string | null; yearLabel: string; year: number | null }
MembershipsBlock      { kind: 'memberships'; introHtml: string; rows: Membership[]; restHtml: string }
AboutBlock            += MembershipsBlock
```

- `organization` — xana 1-in düz mətni (boş ola bilməz; boşdursa sətir atılır, il də boşdursa).
- `href` — xana 1-dəki birinci `http(s)` linki, başqa sxem `null`.
- `yearLabel` — xana 2-nin mətni olduğu kimi (göstərilir); `year` — sıralama açarı (R3).
- `rows` — redaktorun sırası; sıralama view-da (`orderByYear`).
- Çevrilmələr yoxdur (statussuz, silinmə yoxdur): sətir cədvəldə varsa görünür.

## 3. Admin view-modeli (`web-cbar-admin-new`)

```text
NavGroup  = 'about' | 'marketParticipants' | 'legalActs' | 'nationalCurrency' | 'statistics'
          | 'media' | 'cooperation' | 'homepage' | 'admin'
NavItem   { path; key: NavKey; icon; group?: NavGroup }          // mövcud forma
NavEntry  = { kind: 'item'; item: NavItem }                      // qrupsuz və ya tək bəndlik qrup
          | { kind: 'group'; group: NavGroup; items: NavItem[] } // ≥ 2 bənd

ManagedSection { slug (az, `-copy`-siz); kind: 'link'; navKey: NavKey; path }
               | { slug; kind: 'note'; noteKey }                  // üzvlük: cədvəl qaydası
```

Bənd → qrup bölgüsü: [contracts/admin-nav.md](./contracts/admin-nav.md).

## 4. Seed (`0029-international-memberships-seed.sql`)

Şərtlər: [research.md](./research.md) R6. Hər iki dildə məzmun eyni formadadır: başlıq sətri `th` ilə, sonra 14 sətir, Figma sırası ilə (il azalan,
il daxilində Figma sırası).

| # | az (Figma) | en (qaralama tərcümə) | İl |
|---|---|---|---|
| 1 | Beynəlxalq Maliyyə İstehlakçılarının Müdafiəsi Təşkilatı | International Financial Consumer Protection Organisation (FinCoNet) | 2025 |
| 2 | İqtisadi Əməkdaşlıq və İnkişaf Təşkilatının Beynəlxalq Maliyyə Savadlılığı Şəbəkəsi | OECD International Network on Financial Education (OECD/INFE) | 2025 |
| 3 | Berlin Qrup üzrə Açıq Maliyyə İşçi Qrupu | Berlin Group Open Finance Task Force | 2025 |
| 4 | Qlobal Maliyyə İnnovasiyaları Şəbəkəsi | Global Financial Innovation Network (GFIN) | 2025 |
| 5 | Beynəlxalq Qiymətli Kağızlar Komissiyaları Təşkilatının “Artım və inkişaf etməkdə olan bazarlar Komitəsi” | Growth and Emerging Markets Committee of the International Organization of Securities Commissions | 2024 |
| 6 | Beynəlxalq Pul Nişanları Assosiasiyası | International Currency Association | 2022 |
| 7 | Dayanıqlı Bankçılıq və Maliyyə Şəbəkəsi | Sustainable Banking and Finance Network (SBFN) | 2022 |
| 8 | Beynəlxalq Qiymətli Kağızlar Komissiyaları Təşkilatı | International Organization of Securities Commissions (IOSCO) | 2020 |
| 9 | Beynəlxalq Sığorta Nəzarəti Qurumları Assosiasiyası | International Association of Insurance Supervisors (IAIS) | 2020 |
| 10 | Bazel Komitəsinin Bazel Konsultativ Qrupu | Basel Consultative Group of the Basel Committee | 2020 |
| 11 | MDB-yə üzv dövlətlərin qiymətli kağızlar bazarının tənzimlənməsi üzrə səlahiyyətli orqanlarının rəhbərləri Şurası | Council of Heads of Securities Market Regulators of the CIS Member States | 2020 |
| 12 | Maliyyə Savadlılığı üzrə Beynəlxalq Şəbəkə | International Network on Financial Education | 2011 |
| 13 | Pulların Saxtalaşdırılmasına qarşı Mərkəzi Banklar Qrupu | Central Bank Counterfeit Deterrence Group (CBCDG) | 2005 |
| 14 | Mərkəzi Asiya, Qara Dəniz Regionu və Balkan ölkələrinin Mərkəzi Bank Sədrləri Klubu | Club of Governors of Central Banks of Central Asia, the Black Sea Region and the Balkan Countries | 1997 |

Başlıq sətri: az "Təşkilat | Üzvlük tarixi", en "Organization | Year of membership" (saytda göstərilmir, redaktor üçündür).
En səhifə: başlıq "Membership in international organizations", slug `membership-in-international-organizations`.

**Diqqət (redaktor)**: #2 və #12 adları yaxındır (OECD/INFE 2025 və INFE 2011) — Figma-da ikisi də var, seed onları olduğu kimi yazır. En adlar
qaralamadır; redaktor yoxlamalıdır.
