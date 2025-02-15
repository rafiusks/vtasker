import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
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
				// Core Brand Colors
				"ksu-purple": {
					DEFAULT: "#512888",
					hover: "#6E4DA3",
					light: "#9F8DC2",
					lighter: "#D1C7E2",
					subtle: "#F2EFF7",
					dark: "#3B1D66",
					darker: "#251240",
				},
				"muted-teal": {
					DEFAULT: "#2D7D7D",
					light: "#4BA3A3",
					dark: "#1F5757",
					subtle: "#EBF4F4",
				},
				"soft-blue": {
					DEFAULT: "#3B82F6",
					light: "#60A5FA",
					dark: "#2563EB",
					subtle: "#EFF6FF",
				},

				// Semantic Colors
				success: {
					DEFAULT: "#22C55E",
					light: "#DCFCE7",
					dark: "#16A34A",
					subtle: "#F0FDF4",
				},
				error: {
					DEFAULT: "#EF4444",
					light: "#FEE2E2",
					dark: "#DC2626",
					subtle: "#FEF2F2",
				},
				warning: {
					DEFAULT: "#F59E0B",
					light: "#FEF3C7",
					dark: "#D97706",
					subtle: "#FFFBEB",
				},
				info: {
					DEFAULT: "#3B82F6",
					light: "#DBEAFE",
					dark: "#2563EB",
					subtle: "#EFF6FF",
				},

				// Surface Colors
				surface: {
					DEFAULT: "#FFFFFF",
					muted: "#F8F9FC",
					subtle: "#F3F4F6",
					emphasis: "#E5E7EB",
				},

				// Interactive States
				focus: {
					DEFAULT: "#3B82F6",
					ring: "rgba(59, 130, 246, 0.5)",
					visible: "rgba(59, 130, 246, 0.2)",
				},
				hover: {
					light: "rgba(0, 0, 0, 0.04)",
					DEFAULT: "rgba(0, 0, 0, 0.08)",
					dark: "rgba(0, 0, 0, 0.12)",
				},
				active: {
					light: "rgba(0, 0, 0, 0.08)",
					DEFAULT: "rgba(0, 0, 0, 0.12)",
					dark: "rgba(0, 0, 0, 0.16)",
				},

				// System UI Colors
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					hover: "hsl(var(--primary-hover))",
					light: "hsl(var(--primary-light))",
					lighter: "hsl(var(--primary-lighter))",
					subtle: "hsl(var(--primary-subtle))",
					dark: "hsl(var(--primary-dark))",
					darker: "hsl(var(--primary-darker))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					light: "hsl(var(--secondary-light))",
					dark: "hsl(var(--secondary-dark))",
					subtle: "hsl(var(--secondary-subtle))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--error))",
					light: "hsl(var(--error-light))",
					dark: "hsl(var(--error-dark))",
					subtle: "hsl(var(--error-subtle))",
					foreground: "hsl(var(--error-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					light: "hsl(var(--accent-light))",
					dark: "hsl(var(--accent-dark))",
					subtle: "hsl(var(--accent-subtle))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			fontFamily: {
				sans: ["var(--font-sans)", ...fontFamily.sans],
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
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
