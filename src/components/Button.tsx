import type { FC, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "danger";
}

export const Button: FC<ButtonProps> = ({
	variant = "primary",
	className = "",
	children,
	...props
}) => {
	const baseStyles =
		"rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";

	const variantStyles = {
		primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
		secondary:
			"border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
		danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
	};

	return (
		<button
			{...props}
			className={`${baseStyles} ${variantStyles[variant]} ${className}`}
		>
			{children}
		</button>
	);
};
