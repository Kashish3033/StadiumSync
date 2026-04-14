/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#0A0A0A',
        primary: '#00FF41',
        danger: '#FF3366',
      },
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '32px',
      }
    },
  },
  plugins: [],
}
