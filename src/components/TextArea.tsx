import type { FC, TextareaHTMLAttributes } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string;
	error?: string;
}

export const TextArea: FC<TextAreaProps> = ({
	label,
	error,
	className = "",
	id,
	required,
	...props
}) => {
	const textareaId =
		id || props.name || Math.random().toString(36).substring(7);

	return (
		<div>
			{label && (
				<label
					htmlFor={textareaId}
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					{label}
				</label>
			)}
			<textarea
				{...props}
				id={textareaId}
				aria-required={required}
				aria-invalid={!!error}
				aria-describedby={error ? `${textareaId}-error` : undefined}
				className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
					error ? "border-red-300" : ""
				} ${className}`}
			/>
			{error && (
				<p id={`${textareaId}-error`} className="mt-1 text-sm text-red-600">
					{error}
				</p>
			)}
		</div>
	);
};
