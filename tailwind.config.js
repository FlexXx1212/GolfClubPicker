/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black:  '#262625',
          dark:   '#595957',
          muted:  '#999789',
          cream:  '#FFFDD9',
          neon:   '#E1FF00',
        },
      },
      fontFamily: {
        sans:    ['var(--font-syne)', 'system-ui', 'sans-serif'],
        display: ['var(--font-bebas)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
