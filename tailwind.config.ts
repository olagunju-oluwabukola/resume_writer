import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        primary: "#6B46C1",
        "primary-light": "#8B5CF6",
        "primary-lighter": "#A78BFA",
        accent: "#10B981",
        "accent-light": "#34D399",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
    },
  },
  plugins: [],
};

export default config;
