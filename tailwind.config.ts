
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      dropShadow: {
        neon: [
          "0 0 10px rgba(127, 0, 255, 0.8)",
          "0 0 20px rgba(0, 255, 255, 0.5)",
        ],
      },
      backgroundImage: {
        "galactic-radial":
          "radial-gradient(ellipse at center, var(--tw-gradient-stops))",
      },
      animation: {
        "galaxy-pulse": "pulse 2.5s ease-in-out infinite",
        "gradient-shimmer": "shimmer 3s linear infinite",
        "spin-slow": "spin 2s linear infinite",
        "spin-reverse": "spin-reverse 3s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        "spin-reverse": {
          "0%": { transform: "rotate(360deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
