/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b1426',
        panel: '#111d33',
        solar: '#f6b94a',
        mint: '#42d3ad',
        danger: '#fb7185',
      },
      boxShadow: {
        glow: '0 18px 55px rgba(5, 12, 26, .32)',
      },
    },
  },
  plugins: [],
}

