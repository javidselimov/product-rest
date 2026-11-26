# Dokumentasiyalar — CMS redaktorları üçün idarəetmə təlimatları

Hər fayl saytın bir bölməsini admin paneldən necə idarə etməyi və dəyişikliyin saytda harada,
necə görünəcəyini izah edir. Hamısı eyni quruluşdadır: qısa xülasə → hazırlıq → admin paneldə
əməliyyatlar → saytda nə görünür → yoxlama siyahısı → tez-tez rast gələn problemlər →
developerlər üçün əlavə.

## Təşkilat

| Təlimat | Admin panel | Sayt |
|---|---|---|
| [Heyət](heyet-guide.md) — İdarə Heyəti, rəhbərlik, müşavirlər, tərcümeyi-hal, mətbuat fotoları | Təşkilat → Heyət | `/organization?section=…`, bioqrafiya səhifəsi |
| [Struktur bölmələr (Şöbələr)](struktur-bolmeler-guide.md) — şöbə kartı, təsvir, hər dil üçün əsasnamə | Təşkilat → Şöbələr | `/organization?section=divisions`, şöbə səhifəsi |
| [Ərazi idarələri](erazi-idareleri-guide.md) — regional ofislər | Təşkilat → Ofislər | `/organization?section=offices` |
| [Təşkilati struktur sxemi](struktur-sxemi-guide.md) — kliklənən sxem, desktop ağacdan avtomatik, blokların açılan departament siyahısı, «Sıranı dəyiş» | Təşkilat → Struktur sxemi | `/organization?section=divisions` |

## Maliyyə məlumatları

| Təlimat | Admin panel | Sayt |
|---|---|---|
| [Valyuta məzənnələri](valyuta-mezenneleri-guide.md) — günlük cədvəl, Excel import, valyutalar | Məzənnələr | `/currencies`, ana səhifə kartı, köhnə XML feed |
| [Gəlirlilik əyrisi](gelirlilik-eyrisi-guide.md) — üç dataset, Excel import | Gəlirlik əyriləri | `/statistics`, ana səhifə «İcmal göstəricilər» tabı |
| [AZIR](azir-guide.md) — günlük indeks dəyərləri | AZIR | `/statistics/azir`, ana səhifə «Pul bazarı» kartı |
| [İnflyasiya](inflyasiya-guide.md) — aylıq dəyərlər və ana səhifə kartı | İnflyasiya | ana səhifə «İnflyasiya» kartı, `/statistics` |

## Ana səhifə və popup-lar

| Təlimat | Admin panel | Sayt |
|---|---|---|
| [Ana səhifə blokları](ana-sehife-bloklari-guide.md) — bannerlər, xəbər slayderi, qaçan sətirlər, keçidlər, nəşrlər, info sətirləri | Ana səhifə blokları | `/` |
| [Canlı yayım popup-u](canli-yayim-guide.md) | Canlı yayımlar | bütün səhifələrdə popup |
| [Şəkil popup-u](sekil-popup-guide.md) — elan banneri | Şəkil popup-ları | bütün səhifələrdə popup |

## Media

| Təlimat | Admin panel | Sayt |
|---|---|---|
| [Müsahibələr və çıxışlar](musahibeler-ve-cixislar-guide.md) — material, PDF düyməsi, kart şəkli, fayl dili | Press relizlər, növ «Müsahibə və çıxış» | `/press-releases?type=3`, material səhifəsi |
| [Qalereya](qalereya-guide.md) — foto və video siyahısı, menyu linkləri, şəkillərin sırası, Figma ilə fərqlər | Qalereyalar, Videolar, Səhifələr | `/media/galleries`, `/media/videos`, detal səhifələri, ana səhifə |
| [Tədbirlər](tedbirler-guide.md) — gələcək və keçmiş tədbirlər, bölmələr, köhnə tədbirlərin tarixləri | Tədbirlər | `/media/events`, tədbir səhifəsi, ana səhifə «Təqvim» |
| [Media sorğuları](media-sorgulari-guide.md) — mətn və kontakt kartları | Səhifələr → Media → Media Sorğuları | `/media/media-sorgulari` |
| [Məlumatların yayımlanması qrafiki](yayim-qrafiki-guide.md) — sətirlər, qruplar, dövriliklər, «Qrafikə uyğun» pəncərəsi və qərar tarixləri | Yayım qrafiki; Tədbirlər («Qərar» növü) | `/media/release-schedule` |

## Beynəlxalq əməkdaşlıq

| Təlimat | Admin panel | Sayt |
|---|---|---|
| [Mərkəzi banklarla əməkdaşlıq](merkezi-banklarla-emekdasliq-guide.md) — Anlaşma Memorandumları cədvəli, çeşidləmə, giriş mətni | Memorandumlar; Səhifələr → Beynəlxalq əməkdaşlıq | `/merkezi-banklarla-emekdasliq` |
| [Beynəlxalq maliyyə təşkilatları](beynelxalq-maliyye-teskilatlari-guide.md) — təşkilat kartları, loqo, üzvlük tarixləri, giriş mətni | Maliyyə təşkilatları; Səhifələr → Beynəlxalq əməkdaşlıq | `/beynelxalq-teskilatlarla-emekdasliq` |

## İstehlakçıların və investorların hüquqları

| Təlimat | Admin panel | Sayt |
|---|---|---|
| [İstehlakçıların və investorların hüquqları](istehlakci-huquqlari-guide.md) — şikayət indeksləri (Bank/Sığorta tabları, metodologiya), müraciət statistikası (cədvəllər, avtomatik qısa icmal, infoqrafika), inzibati işlər, sənədlər, sol menyu | Səhifələr → İstehlakçıların və investorların hüquqları | `/istehlakcilarin-ve-investorlarin-huquqlari` və alt səhifələri |
| [Aylıq hesabatlar](ayliq-hesabatlar-guide.md) — şikayət indekslərinin (Bank, Sığorta) və infoqrafikanın ay-ay faylları: yeni ay, faylı dəyişmək, ingiliscə fayl, köçürülmüş köhnə arxiv | İstehlakçı hüquqları → Aylıq hesabatlar | «Şikayət indeksləri» səhifəsinin «Son məlumat» və «Arxiv»-i, statistika səhifəsinin «İnfoqrafika» bloku |

## Nəşrlər və tədqiqatlar

| Təlimat | Admin panel | Sayt |
|---|---|---|
| [Nəşrlər və tədqiqatlar](nesrler-ve-tedqiqatlar-guide.md) — faylı kitabxanaya yükləmək, işçi məqaləsi addım-addım (nömrə, JEL, müəlliflər, PDF, xəta mesajları), il arxivinə yeni il və sənəd, tək sənəd səhifələri, bölməyə yeni səhifə, səhifənin menyulardakı yeri, menyu qrupu | Nəşrlər və tədqiqatlar → İşçi məqalələri; Səhifələr → Nəşrlər və tədqiqatlar | `/nesrler-ve-tedqiqatlar`, `/isci-meqaleler-silsilesi`, məqalə səhifəsi `…/NN-YYYY` |

## Sual-cavab

| Təlimat | Admin panel | Sayt |
|---|---|---|
| [Sual-cavab](sual-cavab-guide.md) — mövzular, suallar və cavablar, sıralama, videolar, bölmə səhifəsində keçid kartı, sualın linki, ingiliscə tərcümə | Sual-cavab (Suallar, Mövzular, Videolar) | `/sual-cavab`, `?topic=`, bağlı səhifələrin altında kart |

## FinCERT

| Təlimat | Admin panel | Sayt |
|---|---|---|
| [FinCERT](fincert-guide.md) — missiya, fəaliyyət istiqamətləri, əlaqə, hesabat portalı, RFC-2350 (fayl və ya link), beynəlxalq üzvlüklər (FIRST loqosu), sıralama | FinCERT (Ümumi, Fəaliyyət istiqamətləri, Beynəlxalq üzvlüklər) | `/fincert` |

## Başqa yerdə saxlanılan təlimatlar

- «Haqqımızda» səhifələrinin dizayn blokları (cədvəl, sitat, accordion → kart, banner, timeline):
  `product-rest/web-cbar-new/docs/about-cms-guide.md`.

## Hələ təlimatı olmayan bölmələr

Səhifələr, Press-relizlər (Xəbər və Elan növləri), Qanunvericilik, MEAS, Pul nişanları, Media kitabxanası,
İstifadəçilər və rollar, Parametrlər (o cümlədən əlçatanlıq vidceti).
