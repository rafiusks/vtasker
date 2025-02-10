interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outline";
	isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
	children,
	variant = "primary",
	isLoading = false,
	className = "",
	disabled,
	...props
}) => {
	const baseStyles =
		"px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center justify-center";
	const variantStyles = {
		primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400",
		secondary: "bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-400",
		outline:
			"border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100",
	};

	return (
		<button
			className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${isLoading ? "cursor-wait" : ""}
        ${disabled ? "cursor-not-allowed" : ""}
        ${className}
      `}
			disabled={disabled || isLoading}
			{...props}
		>
			{isLoading ? (
				<>
					<svg
						className="animate-spin -ml-1 mr-2 h-4 w-4"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						aria-label="Loading indicator"
						role="img"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
					Loading...
				</>
			) : (
				children
			)}
		</button>
	);
};
