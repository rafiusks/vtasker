import type { FC } from "react";

export interface Option {
	value: string;
	label: string;
}

export interface SelectProps {
	id?: string;
	label: string;
	value: string | string[];
	onChange: (value: string | string[]) => void;
	options: Option[];
	required?: boolean;
	"data-testid"?: string;
	error?: string;
}

export const Select: FC<SelectProps> = ({
	id,
	label,
	value = "", // Provide default empty string
	onChange,
	options = [], // Provide default empty array
	required,
	"data-testid": testId,
	error,
}) => {
	const isMultiple = Array.isArray(value);
	const currentValue = isMultiple ? value : value || "";

	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		if (isMultiple) {
			const selectedOptions = Array.from(e.target.selectedOptions).map(
				(option) => option.value,
			);
			onChange(selectedOptions);
		} else {
			onChange(e.target.value);
		}
	};

	return (
		<div className="select-wrapper">
			<label htmlFor={id} className="block text-sm font-medium text-gray-700">
				{label}
			</label>
			<select
				id={id}
				value={currentValue}
				onChange={handleChange}
				className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
				required={required}
				data-testid={testId}
				multiple={isMultiple}
				aria-required={required}
				aria-invalid={!!error}
				aria-describedby={error ? `${id}-error` : undefined}
			>
				{!isMultiple && (
					<option key="default" value="">
						Select {label}
					</option>
				)}
				{options.map((option) => (
					<option key={`${option.value}-${option.label}`} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			{error && (
				<p id={`${id}-error`} className="mt-1 text-sm text-red-600">
					{error}
				</p>
			)}
		</div>
	);
};
