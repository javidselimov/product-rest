# Media sorğuları — idarəetmə təlimatı

Bu sənəd cbar.az-ın **«Media sorğuları»** səhifəsini admin paneldən necə idarə etməyi, dəyişikliyin saytda harada,
necə görünəcəyini izah edir.

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel** | Səhifələr → Media → Media Sorğuları (id `519`) |
| **Sayt** | `https://<sayt>/az/media/media-sorgulari`, `https://<sayt>/en/media/media-sorgulari` |
| **Saytda yolu** | Media → **Media sorğuları** |

Səhifədəki bütün mətn və kontaktlar redaktordan gəlir, kodda heç nə yazılmayıb.

## 2. Hazırlıq

Slug `media-sorgulari` dəyişdirilməməlidir: kartlar bu ünvana bağlıdır. Başlığı dəyişmək slug-a təsir etmir.

## 3. Admin paneldə əməliyyatlar

### Mətn

Abzaslar adi mətndir. "Media ilə əməkdaşlıq" kimi bölmə başlığı `Başlıq 3` üslubudur.

### Kontakt kartları

Kartlar səhifədəki **birinci cədvəldən** qurulur. Hər sətir bir kartdır:

| 1-ci sütun | 2-ci sütun | 3-cü sütun |
|---|---|---|
| Kartın adı | Dəyər | Əlavə mətn, boş ola bilər |
| E-mail | press@cbar.az | |
| Telefon | (+994 12) 966 | Daxili nömrə: 2243 |

- **Nömrəni dəyişmək**: xanadakı mətni yazın. Keçid varsa, keçidin ünvanını da dəyişin (`tel:...`).
- **Yeni kart**: cədvələ sətir əlavə edin. Ən çoxu 4 kart olur.
- **Kartı silmək**: sətri silin.

İkon seçilmir, sayt dəyərdən özü tapır: e-poçtda zərf, nömrədə telefon. Başqa dəyərdə (məs. ünvan) ikon olmur.

### Sıfırdan doldurmaq

Repo kökündəki `media-sorgulari-html/` qovluğunda hər dil üçün hazır HTML var. Redaktorda mənbə rejimini (`</>`) açıb
faylın hamısını yapışdırın.

## 4. Saytda nə görünür

Başlıq, mətn, bölmə başlığı, izah mətni və kartlar yazıldığı sıra ilə. Cədvəldən sonra yazılan mətn kartların altına düşür.
Kartlar desktop və planşetdə iki sütun, telefonda bir sütundur.

## 5. Yoxlama siyahısı

- [ ] Hər iki dildə başlıq və mətn doludur.
- [ ] Kartlar görünür, cədvəl görünmür.
- [ ] E-poçta və telefona klik işləyir.
- [ ] EN mətni redaksiyadan keçib.

## 6. Tez-tez rast gələn problemlər

| Problem | Səbəb | Həll |
|---|---|---|
| Kart yerinə cədvəl görünür | Bir sətirdə ad və ya dəyər boşdur, sütun sayı 2–3 deyil, ya 4-dən çox sətir var | Cədvəli düzəldin |
| Kart yerinə cədvəl görünür | Slug dəyişdirilib | Slug-ı `media-sorgulari` edin |
| Kartda ikon yoxdur | Dəyər nə e-poçt, nə nömrədir | Gözlənilən davranışdır |
| Dəyərə klik işləmir | Mətndə keçid yoxdur | Mətnə `mailto:` və ya `tel:` keçidi verin |

## 7. Developerlər üçün

Kontrakt: `specs/037-media-requests/contracts/cms-markup.md`. Parser: `web-cbar-new/src/features/about-content/model/media-requests.ts`.
API və admin kodu dəyişməyib.
