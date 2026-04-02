/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        amz: {
          dark: "#131921",
          nav: "#232F3E",
          bg: "#EAEDED",
          light: "#FFFFFF",
          accent: "#FEBD69",
          accentHover: "#F3A847",
          link: "#007185",
          linkHover: "#C40000",
          text: "#0F1111",
          muted: "#565959"
        },
        bg: {
          base:    "#EAEDED",
          card:    "#FFFFFF",
          surface: "#F2F4F8",
        },
        primary:   "#007185",
        secondary: "#FF9900",
        accent:    "#FEBD69",
        warning:   "#DE7921",
        muted:     "#565959",
      },
      fontFamily: { sans: ["Inter", "sans-serif"] },
      boxShadow: {
        'premium': '0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'premium-hover': '0 12px 24px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
