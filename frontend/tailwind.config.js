import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        blob: "blob 7s infinite",
        "tick-spin": "tick-spin 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        "tick-spin": {
          "0%": {
            transform: "rotate(90deg) scale(0)",
            opacity: "0",
          },
          "100%": {
            transform: "rotate(0deg) scale(1)",
            opacity: "1",
          },
        },
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      "light",
      "dark",
      "valentine",
      "garden",
      "forest",
      "lofi",
      "fantasy",
      "black",
      "dracula",
      "autumn",
      "business",
      "winter",
    ],
  },
};