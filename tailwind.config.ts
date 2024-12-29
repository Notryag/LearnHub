import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // 添加更多自定义颜色
        brand: {
          50: "#e6f1ff",
          100: "#b3d7ff",
          200: "#80bdff",
          300: "#4da3ff",
          400: "#1a89ff",
          500: "#0070f3", // 主品牌色
          600: "#005ac2",
          700: "#004391",
          800: "#002d60",
          900: "#001730"
        },
        accent: {
          50: "#fff3e6",
          100: "#ffdab3",
          200: "#ffc180",
          300: "#ffa74d",
          400: "#ff8e1a",
          500: "#ff7500", // 强调色
          600: "#cc5d00",
          700: "#994500",
          800: "#662e00",
          900: "#331700"
        },
        success: {
          50: "#e6f7f0",
          100: "#b3e6d1",
          200: "#80d4b3",
          300: "#4dc294",
          400: "#1ab075",
          500: "#00965c", // 成功色
          600: "#007a4a",
          700: "#005d38",
          800: "#004126",
          900: "#002414"
        },
        warning: {
          50: "#fff8e6",
          100: "#ffeab3",
          200: "#ffdc80",
          300: "#ffcd4d",
          400: "#ffbf1a",
          500: "#ffaa00", // 警告色
          600: "#cc8900",
          700: "#996600",
          800: "#664400",
          900: "#332200"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "gradient-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" }
        },
        "subtle-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient-flow": "gradient-flow 15s ease infinite",
        "subtle-pulse": "subtle-pulse 2s ease-in-out infinite"
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'large': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'var(--foreground)',
            a: {
              color: 'var(--primary)',
              '&:hover': {
                color: 'var(--primary-foreground)',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
  ],
} satisfies Config

export default config
