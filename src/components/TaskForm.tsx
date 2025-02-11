import { useState } from "react";
import type { Task, TaskMetadata, TaskRelationships } from "../types/task";
import { Input } from "./common/Input";
import { TextArea } from "./common/TextArea";
import { Button } from "./common/Button";
import { SELECT_OPTIONS } from "../types/typeReference";
import { LoadingSpinner } from "./common/LoadingSpinner";

const defaultMetadata: TaskMetadata = {
	created_at: new Date().toISOString(),
	updated_at: new Date().toISOString(),
};

const defaultRelationships: TaskRelationships = {
	dependencies: [],
	labels: [],
};

interface TaskFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (task: Partial<Task>) => void;
	task?: Task;
	allTasks?: Task[];
	isLoading?: boolean;
}

export const TaskForm = ({
	isOpen,
	onClose,
	onSubmit,
	task,
	allTasks = [],
	isLoading = false,
}: TaskFormProps) => {
	const [formData, setFormData] = useState<Partial<Task>>({
		title: task?.title || "",
		description: task?.description || "",
		status_id: task?.status_id || 1,
		priority_id: task?.priority_id || 1,
		type_id: task?.type_id || 1,
		order: task?.order || 0,
		metadata: task?.metadata || defaultMetadata,
		relationships: task?.relationships || defaultRelationships,
	});

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value } = e.target;
		if (name === "status_id" || name === "priority_id" || name === "type_id") {
			setFormData((prev) => ({
				...prev,
				[name]: Number.parseInt(value, 10),
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	if (!isOpen) return null;

	const statusOptions = SELECT_OPTIONS.STATUS;
	const priorityOptions = SELECT_OPTIONS.PRIORITY;
	const typeOptions = SELECT_OPTIONS.TYPE;

	console.log("TaskForm render state:", {
		isLoading,
		statusOptions,
		priorityOptions,
		typeOptions,
		formData,
	});

	if (
		isLoading ||
		!statusOptions.length ||
		!priorityOptions.length ||
		!typeOptions.length
	) {
		console.log("TaskForm showing loading state");
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
				<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
					<div className="flex justify-center items-center h-48">
						<LoadingSpinner />
					</div>
				</div>
			</div>
		);
	}

	console.log("Task form options:", {
		statusOptions,
		priorityOptions,
		typeOptions,
	});

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
			<div
				className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
				data-testid="task-form"
			>
				<h2 className="text-xl font-semibold text-gray-900 mb-4">
					{task ? "Edit Task" : "Create Task"}
				</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					<Input
						label="Title"
						name="title"
						value={formData.title || ""}
						onChange={handleChange}
						required
						data-testid="task-title-input"
					/>

					<TextArea
						label="Description"
						name="description"
						value={formData.description || ""}
						onChange={handleChange}
						rows={3}
						data-testid="task-description-input"
					/>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="status_id"
								className="block text-sm font-medium text-gray-700"
							>
								Status
							</label>
							<select
								id="status_id"
								name="status_id"
								value={formData.status_id || 1}
								onChange={handleChange}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
								required
								data-testid="task-status-select"
							>
								{statusOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>

						<div>
							<label
								htmlFor="priority_id"
								className="block text-sm font-medium text-gray-700"
							>
								Priority
							</label>
							<select
								id="priority_id"
								name="priority_id"
								value={formData.priority_id || 1}
								onChange={handleChange}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
								required
								data-testid="task-priority-select"
							>
								{priorityOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>
					</div>

					<div>
						<label
							htmlFor="type_id"
							className="block text-sm font-medium text-gray-700"
						>
							Type
						</label>
						<select
							id="type_id"
							name="type_id"
							value={formData.type_id || 1}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
							required
							data-testid="task-type-select"
						>
							{typeOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>

					<div className="flex justify-end space-x-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							data-testid="cancel-task-button"
						>
							Cancel
						</Button>
						<Button type="submit" data-testid="submit-task-button">
							{task ? "Save Changes" : "Create Task"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};
