import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";

interface LabelsProps {
	labels: string[];
	onUpdate: (labels: string[]) => void;
	readonly?: boolean;
}

export function Labels({ labels, onUpdate, readonly = false }: LabelsProps) {
	const [newLabel, setNewLabel] = useState("");

	const handleAdd = () => {
		if (!newLabel.trim()) return;

		const updatedLabels = [...labels, newLabel.trim()];
		onUpdate(updatedLabels);
		setNewLabel("");
	};

	const handleRemove = (label: string) => {
		const updatedLabels = labels.filter((l) => l !== label);
		onUpdate(updatedLabels);
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-2">
				{labels.map((label) => (
					<span
						key={label}
						className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-800"
					>
						{label}
						{!readonly && (
							<button
								type="button"
								onClick={() => handleRemove(label)}
								className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:bg-blue-500 focus:text-white focus:outline-none"
							>
								<span className="sr-only">Remove label {label}</span>
								<XMarkIcon className="h-3 w-3" />
							</button>
						)}
					</span>
				))}
			</div>
			{!readonly && (
				<div className="flex gap-2">
					<div className="flex-grow">
						<label
							htmlFor="new-label"
							className="block text-sm font-medium text-gray-700"
						>
							Labels
						</label>
						<div className="mt-1">
							<input
								id="new-label"
								type="text"
								value={newLabel}
								onChange={(e) => setNewLabel(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleAdd();
									}
								}}
								placeholder="Add a label..."
								className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
							/>
						</div>
					</div>
					<button
						type="button"
						onClick={handleAdd}
						className="mt-7 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
					>
						Add
					</button>
				</div>
			)}
		</div>
	);
}
