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
        "dark-primary": "#0b0c1a",
        "dark-secondary": "#181d30",
        "purple-primary": "#572aff",
        "purple-hover": "#6b3fff",
        "red-primary": "#fa0000",
        "red-secondary": "#de0406",
        "gray-border": "#3a3a5a",
        "gray-text": "#6a6a8a",
      },
    },
  },
  plugins: [],
};
