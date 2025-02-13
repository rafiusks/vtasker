import { forwardRef } from "react";

interface TextAreaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	label: string;
	error?: string;
	helperText?: string;
}

const TextArea = forwardRef<
	HTMLTextAreaElement,
	TextAreaProps
>(({ label, error, helperText, className, id, ...props }, ref) => {
	const inputId =
		id || `textarea-${label.toLowerCase().replace(/\s+/g, "-")}`;

	return (
		<div className="w-full">
			<label
				htmlFor={inputId}
				className="block text-sm font-medium text-gray-700 mb-1"
			>
				{label}
			</label>
			<textarea
				ref={ref}
				id={inputId}
				className={`
            w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? "border-red-500" : "border-gray-300"}
            ${className}
          `}
				{...props}
			/>
			{error && <p className="mt-1 text-sm text-red-600">{error}</p>}
			{helperText && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
		</div>
	);
});

TextArea.displayName = "TextArea";

export { TextArea };
