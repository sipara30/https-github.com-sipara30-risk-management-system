/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#45a049',
        black: '#000000',
        white: '#FFFFFF',
      },
    },
  },
  plugins: [],
} 