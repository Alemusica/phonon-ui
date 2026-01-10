import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import tailwindcssTypography from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
    "./stories/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Core semantic colors
        border: "hsl(var(--phonon-border))",
        input: "hsl(var(--phonon-input))",
        ring: "hsl(var(--phonon-ring))",
        background: "hsl(var(--phonon-bg))",
        foreground: "hsl(var(--phonon-fg))",
        primary: {
          DEFAULT: "hsl(var(--phonon-primary))",
          foreground: "hsl(var(--phonon-primary-fg))",
        },
        secondary: {
          DEFAULT: "hsl(var(--phonon-secondary))",
          foreground: "hsl(var(--phonon-secondary-fg))",
        },
        muted: {
          DEFAULT: "hsl(var(--phonon-muted))",
          foreground: "hsl(var(--phonon-muted-fg))",
        },
        accent: {
          DEFAULT: "hsl(var(--phonon-accent))",
          foreground: "hsl(var(--phonon-accent-fg))",
        },
        card: {
          DEFAULT: "hsl(var(--phonon-card))",
          foreground: "hsl(var(--phonon-card-fg))",
        },
        // Nature-inspired Swiss accents
        sage: "hsl(var(--phonon-sage))",
        lake: "hsl(var(--phonon-lake))",
        warm: "hsl(var(--phonon-warm))",
        charcoal: "hsl(var(--phonon-charcoal))",
      },
      fontFamily: {
        display: ['var(--phonon-font-display)', 'Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['var(--phonon-font-body)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--phonon-font-mono)', 'IBM Plex Mono', 'SF Mono', 'monospace'],
      },
      fontSize: {
        'phonon-hero': 'var(--phonon-text-hero)',
        'phonon-display': 'var(--phonon-text-display)',
        'phonon-heading': 'var(--phonon-text-heading)',
        'phonon-subheading': 'var(--phonon-text-subheading)',
        'phonon-index': 'var(--phonon-text-index)',
      },
      spacing: {
        'phi-xs': 'var(--phonon-space-xs)',
        'phi-sm': 'var(--phonon-space-sm)',
        'phi-md': 'var(--phonon-space-md)',
        'phi-lg': 'var(--phonon-space-lg)',
        'phi-xl': 'var(--phonon-space-xl)',
        'phi-2xl': 'var(--phonon-space-2xl)',
        'phi-3xl': 'var(--phonon-space-3xl)',
      },
      lineHeight: {
        'phi': '1.618',
      },
      letterSpacing: {
        'swiss': '-0.03em',
        'swiss-tight': '-0.04em',
        'swiss-wide': '0.2em',
      },
      borderRadius: {
        lg: "var(--phonon-radius)",
        md: "calc(var(--phonon-radius) - 2px)",
        sm: "calc(var(--phonon-radius) - 4px)",
      },
      keyframes: {
        "typing-cursor": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "typing-cursor": "typing-cursor 1s step-end infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-up": "fade-up 0.4s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate, tailwindcssTypography],
} satisfies Config;
