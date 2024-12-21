/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        background: "var(--color-background)",
        text: "var(--color-text)",
        "text-secondary": "var(--color-text-secondary)",
        "button-hover": "var(--color-button-hover)",
        "button-disabled": "var(--color-button-disabled)",
      },
    },
  },
  plugins: [],
};
