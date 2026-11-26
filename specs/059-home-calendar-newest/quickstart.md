# Quickstart: spec 059 yoxlaması

## 1. api-cbar

```bash
cd product-rest/api-cbar/openapi && npm run lint && npm run bundle    # spec-first: sort parameter is in dist/openapi.json
cd .. && dotnet build CbarWebApi.slnx && dotnet test CbarWebApi.slnx
dotnet run --project src/Cbar.WebApi                                  # :5139, api-cbar-admin started first (or PGlite, memory note)
```

Gözlənilən:

- `GET /api/v1/events?locale=az&sort=newest&pageSize=3`: `startsOn` azalan sıradadır, keçmiş və gələcək qarışıqdır.
- `GET /api/v1/events?locale=az&when=upcoming` dəyişikliyə qədərki cavabla eynidir (`diff`).
- `GET /api/v1/events?locale=az&sort=foo` → 400.

## 2. web-cbar-new

```bash
cd product-rest/web-cbar-new && npm run verify
npm run local:testcbar        # :3002, test API (after api-cbar is deployed to test)
```

Gözlənilən (`/az` və `/en`):

- "Təqvim" blokunda test mühitindəki tədbirlərin tarixə görə ən yeni üçü var. `/az/media/events`-də (gələcək + keçmiş) siyahı ilə əl ilə müqayisə.
- Tarix qutusuna klik tədbirin səhifəsini açır. Tab hər sətirdə bir dəfə dayanır, halqa bütün sətri əhatə edir.
- "Təqvim" başlığı `/az/media/events`-i açır.
- Desktop 1440 px: qutu 424 px, sətir ≥ 107 px, tarix qutusu 74 px (`getBoundingClientRect`, Figma ilə müqayisə).
