# Quickstart: Media sorğuları

## Avtomatik yoxlama

```bash
cd product-rest/web-cbar-new && npm run verify
cd product-rest/web-cbar-admin-new && npx vitest run src/features/rich-text/roundtrip.test.ts
```

Testlər Node 22 ilə də işlədilir, CI ona uyğundur.

## Əl ilə yoxlama

1. `cd product-rest/web-cbar-new && npm run local:testcbar`
2. `http://localhost:3002/az/media/media-sorgulari` və `/en/media/media-sorgulari` açın.
3. 1728, 744 və 390 enində kart ölçülərini [contracts/ui-contract.md](contracts/ui-contract.md) ilə tutuşdurun.
4. Admin paneldə telefon xanasını dəyişin, yadda saxlayın, səhifəni yeniləyin. Kartda yeni dəyər görünməlidir.
5. Başqa Media səhifəsindəki cədvəlin görünüşünün dəyişmədiyini yoxlayın.
