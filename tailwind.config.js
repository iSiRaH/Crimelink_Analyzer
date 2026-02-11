/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "dark-bg": "#0b0c1a",
        "dark-panel": "#181d30",
        "dark-border": "#2a3148",
        "dark-border-light": "#3a4158",
      },
    },
  },
  plugins: [],
};
