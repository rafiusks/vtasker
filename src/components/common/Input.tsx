import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string;
	error?: string;
	helperText?: string;
}

const Input = forwardRef<
	HTMLInputElement,
	InputProps
>(({ label, error, helperText, id, className = "", ...props }, ref) => {
	const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
	const errorId = `${inputId}-error`;

	return (
		<div className="w-full">
			<label
				htmlFor={inputId}
				className="block text-sm font-medium text-gray-700 mb-1"
			>
				{label}
			</label>
			<input
				ref={ref}
				id={inputId}
				aria-invalid={!!error}
				aria-describedby={error ? errorId : undefined}
				className={`
            w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? "border-red-500" : "border-gray-300"}
            ${className}
          `}
				{...props}
			/>
			{helperText && !error && (
				<p className="mt-1 text-sm text-gray-500">{helperText}</p>
			)}
			{error && (
				<p
					id={errorId}
					role="alert"
					className="mt-1 text-sm text-red-600"
					data-testid={errorId}
				>
					{error}
				</p>
			)}
		</div>
	);
});

Input.displayName = "Input";

export { Input };
