# Quickstart: spec 041 yoxlaması

Kontraktlar: `contracts/api.md`, `contracts/ui.md`. Model: `data-model.md`.

## 0. Ön şərtlər

- .NET 10 SDK (`C:/Program Files/dotnet`, PATH-da olmaya bilər), Node 24 lokalda, Node 22 CI üçün.
- Docker bu maşında işləmir. Baza PGlite + socket ilə qaldırılır (layihənin API yoxlama üsulu, `version` sütunu qeydi).

## 1. Spec-first (kod dəyişməzdən əvvəl)

```bash
cd product-rest/api-cbar/openapi && npm run lint && npm run bundle
cd product-rest/api-cbar-admin/openapi && npm run lint && npm run bundle
node .claude/skills/sync-openapi/scripts/route-diff.mjs   # marşrut fərqi olmamalıdır
```

Gözlənən: lint təmizdir, `dist/openapi.json`-da `PageNode.showInSideNav` və `PageFlags.showInSideNav` var.

## 2. API-lər

```bash
cd product-rest/api-cbar-admin && dotnet build
cd product-rest/api-cbar && dotnet build
diff -r product-rest/api-cbar/src/Cbar.Domain product-rest/api-cbar-admin/src/Cbar.Domain   # boş olmalıdır
```

Stack-i işə salın (əvvəl admin API):

| Addım | Gözlənən |
|---|---|
| Admin API boot | `schema_migrations`-da `0024-page-details.sql`, `page_details` cədvəli var, FK yalnız hüquq olanda |
| Boot ikinci dəfə | Miqrasiya atlanır, xəta yoxdur |
| `GET /api/v1/pages/{id}` (admin) | `flags.showInSideNav: true`, `page_details`-də sətir yoxdur |
| `PUT /api/v1/pages/{id}`, `flags.showInSideNav: false` | 200, `page_details`-də sətir `false`, `audit_log`-da `pages.update` |
| `PUT`, `flags` var, amma `showInSideNav` yoxdur | dəyər `false` qalır (R4) |
| `PUT`, `showInSideNav: true` | sətir `true` olur |
| `GET /api/v1/pages/tree?locale=az` (api-cbar, `cbar_web_ro`) | səhifə ağacdadır, `showInSideNav: false`, uşaqları onun altındadır |
| Səhifə silinir (soft) | ağacda yoxdur, xəta yoxdur |

## 3. web-cbar-new

```bash
cd product-rest/web-cbar-new && npm run verify
npx -y node@22 node_modules/vitest/vitest.mjs run src/widgets/section-shell src/widgets/section-sidebar src/entities/page-node
```

Brauzerdə (`npm run dev`, :3001, lokal API):

1. Media altındakı bir səhifədə bayrağı söndürün → `/az/media`: bənd sol menyuda yoxdur, mega menyuda var.
2. Həmin səhifəni açın: sol menyuda aktivdir, breadcrumb "Ana səhifə › Media › …".
3. Köhnə görünüşlü bölmədə (məs. Pul siyasəti) eyni yoxlama.
4. `/en`-də eyni nəticə.

## 4. web-cbar-admin-new

```bash
cd product-rest/web-cbar-admin-new && npm run verify
```

Brauzerdə (`npm run dev`, :5174):

1. Yeni səhifə: "Sol menyuda göstər" açıqdır.
2. Bayrağı söndürün: kartda "Üst menyu: Görünəcək", "Sol menyu: Görünməyəcək: sol menyuda göstərilmir" və açıq olanda görünmə
   qeydi. Saxlayın: ağacda "Sol menyuda gizli" nişanı.
3. Onun alt səhifəsini açın: səbəb "valideyn sol menyuda gizlidir".
4. Kök səhifəni açın: səbəb "bölmənin kökü, sol menyunun başlığıdır".
5. "Menyuda görünür"-ü söndürün: hər iki sətir görünməyəcək.

## 5. SC-005: yayımdan əvvəl və sonra eyni menyu

Test API-də bayraq heç bir səhifədə söndürülməyib. Yeni saytda Haqqımızda, Media və iki köhnə görünüşlü bölmənin sol menyusunu
köhnə saytın HTML-i ilə tutuşdurun (bənd siyahısı eyni olmalıdır).
