// Tailwind v4 Next-in PostCSS pipeline-ı ilə işləyir (R-008).
// `@tailwindcss/vite` gətirilmir — bu layihədə Vite yoxdur.
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
