import { LoadingSpinner } from "./LoadingSpinner";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outline" | "danger";
	isLoading?: boolean;
}

export const Button = ({
	children,
	variant = "primary",
	isLoading = false,
	className = "",
	disabled,
	...props
}: ButtonProps) => {
	const baseClasses =
		"inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

	const variantClasses = {
		primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
		secondary:
			"bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500",
		outline:
			"border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
		danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
	};

	return (
		<button
			className={`${baseClasses} ${variantClasses[variant]} ${className}`}
			disabled={disabled || isLoading}
			{...props}
		>
			{isLoading ? (
				<>
					<LoadingSpinner className="w-4 h-4 mr-2" />
					Loading...
				</>
			) : (
				children
			)}
		</button>
	);
};
