/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        burger: { red: '#b91c1c', yellow: '#f59e0b', bun: '#fbbf24' }
      }
    }
  },
  plugins: []
};

