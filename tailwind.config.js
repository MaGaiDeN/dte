/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom colors for light mode
        'light-bg': '#f1f3f6',
        'light-card': '#f8f9fb',
        'light-border': '#eceef2',
      },
      backgroundColor: {
        'light-primary': '#f1f3f6',
        'light-secondary': '#f8f9fb',
      },
    },
  },
  plugins: [],
}