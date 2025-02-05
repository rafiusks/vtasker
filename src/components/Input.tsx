import type { FC, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
}

export const Input: FC<InputProps> = ({
	label,
	error,
	className = "",
	id,
	required,
	...props
}) => {
	const inputId = id || props.name || Math.random().toString(36).substring(7);

	return (
		<div>
			{label && (
				<label
					htmlFor={inputId}
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					{label}
				</label>
			)}
			<input
				{...props}
				id={inputId}
				aria-required={required}
				aria-invalid={!!error}
				aria-describedby={error ? `${inputId}-error` : undefined}
				className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
					error ? "border-red-300" : ""
				} ${className}`}
			/>
			{error && (
				<p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
					{error}
				</p>
			)}
		</div>
	);
};
