/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'charcoal': '#2F2F2F',
        'forest': '#2A4F4A',
        'trusty-blue': '#0057FF',
        'off-white': '#FBFBFB',
        'background': '#F4F7F6',
      }
    },
  },
  plugins: [],
}