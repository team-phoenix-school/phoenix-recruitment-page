/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./script.js",
    "./*.html"
  ],
  theme: {
    extend: {
      colors: {
        'phoenix-magenta': '#A70240',
        'phoenix-black': '#000000',
        'phoenix-white': '#ffffff'
      },
      fontFamily: {
        'axiforma': ['Axiforma', 'Arial', 'sans-serif'],
        'acumin': ['Acumin Variable Concept', 'Arial', 'sans-serif']
      }
    },
  },
  plugins: [],
}
