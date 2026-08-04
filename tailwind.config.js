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
        gold: "#D4AF37",
        cream: "#FFFBF0",
        charcoal: "#2D2D2D",
        // Warm dark accent for headings/labels that used to render as gold
        // text on a dark background — gold-on-cream fails contrast (~2:1),
        // so readable heading/label text uses this instead. Gold itself stays
        // reserved for buttons, borders, badges, and other accent fills.
        cocoa: "#6B4423",
        "light-gray": "#F7F7F7",
        midnight: "#0B1526",
        "midnight-light": "#12213F",
        ink: "#0F2044",
        "deep-navy": "#0F1629",
      },
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
        "nunito-sans": ["Nunito Sans", "sans-serif"],
        cinzel: ["Cinzel", "serif"],
        playfair: ["Playfair Display", "serif"],
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
