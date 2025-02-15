export const typography = {
	fonts: {
		sans: "var(--font-sans)",
		mono: "var(--font-mono)",
	},
	weights: {
		normal: "400",
		medium: "500",
		semibold: "600",
		bold: "700",
	},
	sizes: {
		xs: "0.75rem", // 12px
		sm: "0.875rem", // 14px
		base: "1rem", // 16px
		lg: "1.125rem", // 18px
		xl: "1.25rem", // 20px
		"2xl": "1.5rem", // 24px
		"3xl": "1.875rem", // 30px
		"4xl": "2.25rem", // 36px
	},
	lineHeights: {
		tight: "1.25",
		normal: "1.5",
		relaxed: "1.75",
	},
};

export const spacing = {
	px: "1px",
	0: "0",
	0.5: "0.125rem",
	1: "0.25rem",
	1.5: "0.375rem",
	2: "0.5rem",
	2.5: "0.625rem",
	3: "0.75rem",
	3.5: "0.875rem",
	4: "1rem",
	5: "1.25rem",
	6: "1.5rem",
	7: "1.75rem",
	8: "2rem",
	9: "2.25rem",
	10: "2.5rem",
	12: "3rem",
	14: "3.5rem",
	16: "4rem",
	20: "5rem",
	24: "6rem",
	28: "7rem",
	32: "8rem",
	36: "9rem",
	40: "10rem",
	44: "11rem",
	48: "12rem",
	52: "13rem",
	56: "14rem",
	60: "15rem",
	64: "16rem",
	72: "18rem",
	80: "20rem",
	96: "24rem",
};

export const breakpoints = {
	sm: "640px",
	md: "768px",
	lg: "1024px",
	xl: "1280px",
	"2xl": "1536px",
};

export const zIndices = {
	0: "0",
	10: "10",
	20: "20",
	30: "30",
	40: "40",
	50: "50",
	auto: "auto",
	dropdown: "1000",
	sticky: "1020",
	fixed: "1030",
	modalBackdrop: "1040",
	modal: "1050",
	popover: "1060",
	tooltip: "1070",
};

// These are already defined in globals.css but we're exposing them here for TypeScript
export const colors = {
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
	accent: {
		DEFAULT: "hsl(var(--accent))",
		light: "hsl(var(--accent-light))",
		dark: "hsl(var(--accent-dark))",
		subtle: "hsl(var(--accent-subtle))",
		foreground: "hsl(var(--accent-foreground))",
	},
	surface: {
		DEFAULT: "hsl(var(--surface))",
		muted: "hsl(var(--surface-muted))",
		subtle: "hsl(var(--surface-subtle))",
		emphasis: "hsl(var(--surface-emphasis))",
	},
	semantic: {
		success: {
			DEFAULT: "hsl(var(--success))",
			light: "hsl(var(--success-light))",
			dark: "hsl(var(--success-dark))",
			subtle: "hsl(var(--success-subtle))",
			foreground: "hsl(var(--success-foreground))",
		},
		error: {
			DEFAULT: "hsl(var(--error))",
			light: "hsl(var(--error-light))",
			dark: "hsl(var(--error-dark))",
			subtle: "hsl(var(--error-subtle))",
			foreground: "hsl(var(--error-foreground))",
		},
		warning: {
			DEFAULT: "hsl(var(--warning))",
			light: "hsl(var(--warning-light))",
			dark: "hsl(var(--warning-dark))",
			subtle: "hsl(var(--warning-subtle))",
			foreground: "hsl(var(--warning-foreground))",
		},
		info: {
			DEFAULT: "hsl(var(--info))",
			light: "hsl(var(--info-light))",
			dark: "hsl(var(--info-dark))",
			subtle: "hsl(var(--info-subtle))",
			foreground: "hsl(var(--info-foreground))",
		},
	},
};
