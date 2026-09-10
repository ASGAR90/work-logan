import type { Config } from "tailwindcss";

// Mirrors the GSAP tokens defined in src/app/styles.css (source: DESIGN.md),
// so utility classes and the stylesheet cannot drift apart.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        "just-black": "#0e100f",
        "off-black": "#191919",
        "surface-cream": "#fffce1",
        "surface-50": "#7c7c6f",
        "surface-25": "#42433d",
        green: "#0ae448",
        "light-green": "#abff84",
        orangey: "#ff8709",
        pink: "#fec5fb",
        lilac: "#9d95ff",
        blue: "#00bae2"
      },
      fontFamily: {
        mori: ["Inter Tight", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"]
      },
      fontSize: {
        caption: ["14px", { lineHeight: "1.4", letterSpacing: "-0.14px" }],
        "body-sm": ["16px", { lineHeight: "1.15" }],
        body: ["19px", { lineHeight: "1.15" }],
        "body-lg": ["23px", { lineHeight: "1.38", letterSpacing: "-0.23px" }],
        subheading: ["34px", { lineHeight: "1.2", letterSpacing: "-0.34px" }],
        "heading-sm": ["44px", { lineHeight: "1.2", letterSpacing: "-0.44px" }],
        heading: ["66px", { lineHeight: "1.2", letterSpacing: "-0.66px" }],
        "heading-lg": ["101px", { lineHeight: "1", letterSpacing: "-1.11px" }],
        display: ["224px", { lineHeight: "0.9", letterSpacing: "-4.48px" }]
      },
      borderRadius: { card: "8px", tag: "8px", button: "100px", pill: "9999px" },
      maxWidth: { page: "1280px" }
    }
  },
  plugins: []
} satisfies Config;
