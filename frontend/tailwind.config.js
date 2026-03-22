/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          base:    "#0F0E17",
          card:    "#1A1A2E",
          surface: "#16213E",
        },
        primary:   "#6C63FF",
        secondary: "#FF6584",
        accent:    "#43D9AD",
        warning:   "#FFA34D",
        muted:     "#A7A9BE",
      },
      fontFamily: { sans: ["Inter", "sans-serif"] },
      backgroundImage: {
        "grad-primary": "linear-gradient(135deg, #6C63FF, #FF6584)",
      },
    },
  },
  plugins: [],
};
