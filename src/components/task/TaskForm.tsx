import { useState, useEffect, useCallback } from "react";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import type { Task } from "../../types";
import type {
	TaskStatusUI,
	TaskPriorityEntity,
	TaskTypeEntity,
} from "../../types/typeReference";
import { LoadingSpinner } from "../common/LoadingSpinner";

interface TaskFormProps {
	onSubmit: (data: Partial<Task>) => void;
	onCancel?: () => void;
	initialData?: Partial<Task>;
	isLoading?: boolean;
	statusOptions: TaskStatusUI[];
	priorityOptions: TaskPriorityEntity[];
	typeOptions: TaskTypeEntity[];
}

interface FormData {
	title: string;
	description: string;
	status_id: number;
	priority_id: number;
	type_id: number;
}

export const TaskForm = ({
	onSubmit,
	onCancel,
	initialData,
	isLoading = false,
	statusOptions,
	priorityOptions,
	typeOptions,
}: TaskFormProps) => {
	const [formData, setFormData] = useState<FormData>(() => {
		const defaultStatusId = statusOptions[0]?.id;
		const defaultPriorityId = priorityOptions[0]?.id;
		const defaultTypeId = typeOptions[0]?.id;

		return {
			title: initialData?.title || "",
			description: initialData?.description || "",
			status_id: initialData?.status_id || defaultStatusId || 1,
			priority_id: initialData?.priority_id || defaultPriorityId || 1,
			type_id: initialData?.type_id || defaultTypeId || 1,
		};
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isReady, setIsReady] = useState(false);

	// Update form data when initialData or options change
	useEffect(() => {
		if (initialData || statusOptions.length > 0) {
			setFormData((prev) => ({
				title: initialData?.title || prev.title,
				description: initialData?.description || prev.description,
				status_id:
					initialData?.status_id || statusOptions[0]?.id || prev.status_id,
				priority_id:
					initialData?.priority_id ||
					priorityOptions[0]?.id ||
					prev.priority_id,
				type_id: initialData?.type_id || typeOptions[0]?.id || prev.type_id,
			}));
		}
	}, [initialData, statusOptions, priorityOptions, typeOptions]);

	// Check if form is ready
	useEffect(() => {
		const hasRequiredOptions =
			statusOptions.length > 0 &&
			priorityOptions.length > 0 &&
			typeOptions.length > 0;

		setIsReady(hasRequiredOptions);
	}, [statusOptions, priorityOptions, typeOptions]);

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();

			// Prevent browser's default validation
			const form = e.target as HTMLFormElement;
			form.setAttribute("novalidate", "true");

			// Run validation first
			const newErrors: Record<string, string> = {};
			if (!formData.title.trim()) {
				newErrors.title = "Title is required";
			}
			setErrors(newErrors);

			// Only submit if there are no errors
			if (Object.keys(newErrors).length === 0) {
				onSubmit({
					...initialData,
					title: formData.title.trim(),
					description: formData.description.trim(),
					status_id: formData.status_id,
					priority_id: formData.priority_id,
					type_id: formData.type_id,
					board_id: initialData?.board_id,
					content: {
						description: formData.description.trim(),
						acceptance_criteria: [],
						attachments: [],
					},
				});
			}
		},
		[formData, initialData, onSubmit],
	);

	const handleChange = useCallback(
		(
			e: React.ChangeEvent<
				HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
			>,
		) => {
			const { name, value } = e.target;
			setFormData((prev) => ({
				...prev,
				[name]: name.endsWith("_id") ? Number(value) : value,
			}));

			// Clear error when user starts typing
			if (errors[name]) {
				setErrors((prev) => {
					const newErrors = { ...prev };
					delete newErrors[name];
					return newErrors;
				});
			}
		},
		[errors],
	);

	if (!isReady) {
		return (
			<div
				className="flex justify-center items-center p-4"
				data-testid="task-form-loading"
			>
				<LoadingSpinner />
				<span className="ml-2">Loading form options...</span>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} data-testid="task-form">
			<div className="space-y-4">
				<Input
					label="Title"
					name="title"
					value={formData.title}
					onChange={handleChange}
					error={errors.title}
					required
					data-testid="task-title-input"
				/>
				<Input
					label="Description"
					name="description"
					value={formData.description}
					onChange={handleChange}
					error={errors.description}
					data-testid="task-description-input"
				/>
				<div className="grid grid-cols-3 gap-4">
					<div>
						<label
							htmlFor="type"
							className="block text-sm font-medium text-gray-700"
						>
							Type
						</label>
						<select
							id="type"
							name="type_id"
							value={formData.type_id}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
							data-testid="task-type-select"
						>
							{typeOptions.map((type) => (
								<option key={type.id} value={type.id}>
									{type.name}
								</option>
							))}
						</select>
					</div>
					<div>
						<label
							htmlFor="priority"
							className="block text-sm font-medium text-gray-700"
						>
							Priority
						</label>
						<select
							id="priority"
							name="priority_id"
							value={formData.priority_id}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
							data-testid="task-priority-select"
						>
							{priorityOptions.map((priority) => (
								<option key={priority.id} value={priority.id}>
									{priority.name}
								</option>
							))}
						</select>
					</div>
					<div>
						<label
							htmlFor="status"
							className="block text-sm font-medium text-gray-700"
						>
							Status
						</label>
						<select
							id="status"
							name="status_id"
							value={formData.status_id}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
							data-testid="task-status-select"
						>
							{statusOptions.map((status) => (
								<option key={status.id} value={status.id}>
									{status.name}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>
			<div className="mt-4 flex justify-end space-x-2">
				{onCancel && (
					<Button
						type="button"
						variant="secondary"
						onClick={onCancel}
						data-testid="cancel-task-button"
					>
						Cancel
					</Button>
				)}
				<Button
					type="submit"
					variant="primary"
					disabled={isLoading || !isReady}
					data-testid="submit-create-task-button"
				>
					{isLoading ? <LoadingSpinner /> : initialData ? "Update" : "Create"}
				</Button>
			</div>
		</form>
	);
};
