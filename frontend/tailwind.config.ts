import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1180px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      colors: {
        // Brand
        brand: {
          DEFAULT: "#5B5FF8",
          50: "#EEF0FF",
          100: "#E0E3FF",
          200: "#C5CAFF",
          300: "#9CA4FF",
          400: "#7B82FB",
          500: "#5B5FF8",
          600: "#4845EA",
          700: "#3D35CF",
          800: "#332EA8",
          900: "#2E2D85",
        },
        accent: {
          DEFAULT: "#00C2A8",
          50: "#E6FBF7",
          500: "#00C2A8",
          600: "#00A18B",
        },
        secondary: {
          DEFAULT: "#7C3AED",
          500: "#7C3AED",
          600: "#6D28D9",
        },
        // Semantic
        background: "#FFFFFF",
        "section-bg": "#F8FAFC",
        surface: "#FFFFFF",
        "surface-2": "#F8FAFC",
        "surface-3": "#F1F5F9",
        line: "#E9ECF2",
        "line-2": "#E0E4EC",
        "line-strong": "#CDD3DE",
        ink: "#111827",
        muted: "#6B7280",
        subtle: "#9CA3AF",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      borderRadius: {
        sm: "10px",
        md: "13px",
        lg: "18px",
        xl: "22px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(17,24,39,0.05), 0 6px 16px -8px rgba(17,24,39,0.08)",
        md: "0 10px 34px -14px rgba(17,24,39,0.16)",
        lg: "0 40px 90px -40px rgba(17,24,39,0.28)",
        glow: "0 14px 34px -10px rgba(91,95,248,0.32)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #5B5FF8 0%, #7C3AED 50%, #00C2A8 100%)",
        "field-glow":
          "radial-gradient(circle at 50% -20%, rgba(91,95,248,0.22), transparent 60%)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-9px)" },
        },
        marquee: { to: { transform: "translateX(-50%)" } },
        pulse: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".35" } },
        screenIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        marquee: "marquee 26s linear infinite",
        pulse: "pulse 1.8s ease-in-out infinite",
        screenIn: "screenIn .4s ease both",
        "fade-up": "fade-up .7s cubic-bezier(.2,.7,.2,1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
