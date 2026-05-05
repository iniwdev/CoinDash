/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#F7931A',
        accent: 'var(--accent)',
        background: 'var(--background)',
        card: 'var(--card)',
        border: 'var(--border)',
      },
    },
  },
  plugins: [],
}