import { useState, useEffect } from "react";
import type { Task, AcceptanceCriterion } from "../types";
import { TaskMetadata } from "./TaskMetadata";
import { AcceptanceCriteria } from "./AcceptanceCriteria";

interface TaskDetailProps {
	task?: Task;
	onUpdate: (updates: Partial<Task>) => void;
	onClose: () => void;
	isOpen: boolean;
}

export function TaskDetail({
	task,
	onUpdate,
	onClose,
	isOpen,
}: TaskDetailProps) {
	const [description, setDescription] = useState(task?.description ?? "");
	const [implementationDetails, setImplementationDetails] = useState(
		task?.content?.implementation_details ?? "",
	);
	const [notes, setNotes] = useState(task?.content?.notes ?? "");

	useEffect(() => {
		if (task) {
			setDescription(task.description);
			setImplementationDetails(task.content?.implementation_details ?? "");
			setNotes(task.content?.notes ?? "");
		}
	}, [task]);

	if (!task || !isOpen) return null;

	const handleSave = () => {
		onUpdate({
			...task,
			description,
			content: {
				...task.content,
				description,
				implementation_details: implementationDetails,
				notes,
			},
		});
	};

	const handleAcceptanceCriteriaUpdate = (criteria: AcceptanceCriterion[]) => {
		onUpdate({
			...task,
			content: {
				...task.content,
				acceptance_criteria: criteria,
			},
		});
	};

	return (
		<div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
			<div className="space-y-6">
				{/* Title and Close Button */}
				<div className="flex items-start justify-between">
					<h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-500"
						aria-label="Close dialog"
					>
						<svg
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{/* Description */}
				<div>
					<label
						htmlFor="description"
						className="block text-sm font-medium text-gray-900"
					>
						Description
					</label>
					<textarea
						id="description"
						rows={3}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						onBlur={handleSave}
						className="mt-1 block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:py-1.5 sm:text-sm sm:leading-6"
					/>
				</div>

				{/* Acceptance Criteria */}
				<AcceptanceCriteria
					criteria={task.content?.acceptance_criteria || []}
					onUpdate={handleAcceptanceCriteriaUpdate}
				/>

				{/* Implementation Details */}
				<div>
					<label
						htmlFor="implementation-details"
						className="block text-sm font-medium text-gray-900"
					>
						Implementation Details
					</label>
					<textarea
						id="implementation-details"
						rows={4}
						value={implementationDetails}
						onChange={(e) => setImplementationDetails(e.target.value)}
						onBlur={handleSave}
						className="mt-1 block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:py-1.5 sm:text-sm sm:leading-6"
					/>
				</div>

				{/* Notes */}
				<div>
					<label
						htmlFor="notes"
						className="block text-sm font-medium text-gray-900"
					>
						Notes
					</label>
					<textarea
						id="notes"
						rows={3}
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						onBlur={handleSave}
						className="mt-1 block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:py-1.5 sm:text-sm sm:leading-6"
					/>
				</div>

				{/* Task Metadata */}
				<TaskMetadata task={task} onUpdate={onUpdate} />
			</div>
		</div>
	);
}
