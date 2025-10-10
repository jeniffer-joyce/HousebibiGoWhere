/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#00B8D9",
        "secondary": "#F4F4F4",
        "accent": "#ff7a5c",
        "background": "#ffffffff",
        "background-light": "var(--background-color)",
        "background-dark": "#121320",
        // "primary-transparent": "#00B8D9",
        "creamy-white": "#fffcf8",
        "background-light": "#f6f8f8",
        "text-light": "#101f22",
        // "text-dark": "#f6f8f8",
        "subtle-light": "#e3e9e9",
        // "subtle-dark": "#202f32",
        "placeholder-light": "#618389",
        // "placeholder-dark": "#a0b8bc",
        "border-light": "#dbe4e6",
        // "border-dark": "#304f52",

      },
      fontFamily: {
        "display": ["Manrope"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}