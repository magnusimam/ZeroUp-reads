/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#1F3D6E",
        amber: "#E8A020",
        "sky-blue": "#2D6BE4",
        green: "#3DBE8A",
        coral: "#FF6B6B",
        gold: "#F5A623",
        cream: "#FFF8ED",
        charcoal: "#2D2D2D",
        "light-gray": "#F7F7F7",
      },
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
        "nunito-sans": ["Nunito Sans", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        btn: "12px",
        badge: "999px",
        input: "10px",
      },
      maxWidth: {
        content: "1280px",
      },
      boxShadow: {
        card: "0 4px 20px rgba(31,61,110,0.10)",
        "card-hover": "0 12px 40px rgba(31,61,110,0.18)",
        nav: "0 2px 16px rgba(31,61,110,0.08)",
      },
    },
  },
  plugins: [],
};
