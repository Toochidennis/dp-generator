/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        // Public microsite type system
        display: ['"Bricolage Grotesque"', "ui-sans-serif", "system-ui", "sans-serif"],
        body: ['"Hanken Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
        code: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        // Kids Code Bootcamp palette (grounded in the Digital Dreams logo)
        ink: "#0E1428",
        paper: "#FFF7EC",
        brand: { DEFAULT: "#F8A018", dark: "#E08900", soft: "#FFE7BD" },
        pop: { blue: "#2E6BE6", mint: "#18B486", coral: "#FF5C49" },
      },
      boxShadow: {
        panel: "0 20px 60px -28px rgba(15, 23, 42, 0.3)",
        block: "0 6px 0 0 rgba(14,20,40,0.16)",
        blockSm: "0 4px 0 0 rgba(14,20,40,0.14)",
        badge: "0 40px 80px -40px rgba(14,20,40,0.55)",
      },
    },
  },
  plugins: [],
};
