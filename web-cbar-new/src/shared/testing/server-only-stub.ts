/**
 * `server-only` markerinin Vitest əvəzi.
 *
 * Next build-də `server-only` client bundle-ında import olunanda xəta atır;
 * Vitest-də belə sərhəd yoxdur, ona görə `vitest.config.mts` bu boş modulu
 * alias kimi verir. Məhsul kodu dəyişmir.
 */
export {}
