/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta com contraste minimo de 4.5:1 sobre branco (WCAG 1.4.3)
        cidade: {
          fundo: '#F7F9FB',
          texto: '#1F2933',
          suave: '#52606D',
          borda: '#CBD2D9',
          primaria: '#0B6E4F',
          primariaEscura: '#08533B',
          destaque: '#B45309',
          alerta: '#B91C1C',
          info: '#1D4ED8',
        },
      },
    },
  },
  plugins: [],
};
