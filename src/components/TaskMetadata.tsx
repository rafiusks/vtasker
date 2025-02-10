import { useState, useEffect } from "react";
import type { Task } from "../types";

interface TaskMetadataProps {
	task: Task;
	onUpdate: (updates: Partial<Task>) => void;
}

export function TaskMetadata({ task, onUpdate }: TaskMetadataProps) {
	const [dueDate, setDueDate] = useState(task.content.due_date);
	const [assignee, setAssignee] = useState(task.content.assignee);
	const [labels, setLabels] = useState(task.relationships.labels);
	const [newLabel, setNewLabel] = useState("");

	useEffect(() => {
		setDueDate(task.content.due_date);
		setAssignee(task.content.assignee);
		setLabels(task.relationships.labels);
	}, [task]);

	const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newDueDate = e.target.value || undefined;
		setDueDate(newDueDate);
		onUpdate({
			content: {
				...task.content,
				due_date: newDueDate,
			},
		});
	};

	const handleAssigneeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newAssignee = e.target.value || undefined;
		setAssignee(newAssignee);
		onUpdate({
			content: {
				...task.content,
				assignee: newAssignee,
			},
		});
	};

	const handleAddLabel = () => {
		if (!newLabel.trim()) return;

		const newLabels = [...labels, newLabel.trim()];
		setLabels(newLabels);
		setNewLabel("");
		onUpdate({
			relationships: {
				...task.relationships,
				labels: newLabels,
			},
		});
	};

	const handleRemoveLabel = (label: string) => {
		const newLabels = labels.filter((l) => l !== label);
		setLabels(newLabels);
		onUpdate({
			relationships: {
				...task.relationships,
				labels: newLabels,
			},
		});
	};

	return (
		<div className="space-y-4">
			{/* Labels Section */}
			<div>
				<label
					htmlFor="new-label"
					className="block text-sm font-medium text-gray-700"
				>
					Labels
				</label>
				<div className="mt-1 flex flex-wrap gap-2">
					{labels.map((label) => (
						<span
							key={label}
							className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-sm font-medium text-gray-800"
						>
							{label}
							<button
								type="button"
								onClick={() => handleRemoveLabel(label)}
								className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500 focus:bg-gray-500 focus:text-white focus:outline-none"
							>
								<span className="sr-only">Remove label {label}</span>×
							</button>
						</span>
					))}
				</div>
				<div className="mt-2 flex">
					<input
						id="new-label"
						type="text"
						value={newLabel}
						onChange={(e) => setNewLabel(e.target.value)}
						className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						placeholder="Add a label"
					/>
					<button
						type="button"
						onClick={handleAddLabel}
						className="ml-2 inline-flex items-center rounded border border-transparent bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
					>
						Add
					</button>
				</div>
			</div>

			{/* Due Date Section */}
			<div>
				<label
					htmlFor="due-date"
					className="block text-sm font-medium text-gray-700"
				>
					Due Date
				</label>
				<input
					id="due-date"
					type="date"
					value={dueDate || ""}
					onChange={handleDueDateChange}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				/>
			</div>

			{/* Assignee Section */}
			<div>
				<label
					htmlFor="assignee"
					className="block text-sm font-medium text-gray-700"
				>
					Assignee
				</label>
				<input
					id="assignee"
					type="text"
					value={assignee || ""}
					onChange={handleAssigneeChange}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
					placeholder="Enter assignee name"
				/>
			</div>
		</div>
	);
}
