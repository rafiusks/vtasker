/**
 * Common types for UI components
 */

export interface BaseProps {
	className?: string;
	children?: React.ReactNode;
}

export interface ButtonProps extends BaseProps {
	variant?: "primary" | "secondary" | "outline" | "ghost";
	size?: "sm" | "md" | "lg";
	disabled?: boolean;
	loading?: boolean;
	onClick?: () => void;
}

export interface InputProps extends BaseProps {
	type?: "text" | "password" | "email" | "number";
	placeholder?: string;
	value?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	error?: string;
	disabled?: boolean;
}
