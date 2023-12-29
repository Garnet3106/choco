/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        white: 'var(--white-color)',
        base: 'var(--base-color)',
        main: 'var(--main-color)',
      },
    },
  },
  plugins: [],
};
