import type { FC } from "react";
import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import type {
	Task,
	TaskMetadata,
	TaskContent,
	TaskRelationships,
} from "../types";
import { AcceptanceCriteria } from "./AcceptanceCriteria";
import { Labels } from "./Labels";
import { toast } from "react-hot-toast";
import { Input } from "./Input";
import { TextArea } from "./TextArea";
import { Button } from "./Button";
import { SELECT_OPTIONS } from "../types/typeReference";

interface TaskFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (task: Partial<Task>) => void;
	task?: Task;
	allTasks: Task[];
}

interface TaskFormData {
	title: string;
	description: string;
	status_id: string;
	priority_id: string;
	type_id: string;
	order: number;
	content: TaskContent;
	relationships: TaskRelationships;
	metadata: TaskMetadata;
}

const defaultContent: TaskContent = {
	description: "",
	acceptance_criteria: [],
	implementation_details: "",
	notes: "",
	attachments: [],
	due_date: undefined,
	assignee: "",
};

const getNextOrder = (tasks: Task[], statusId: string): number => {
	if (!tasks.length) return 0;
	const tasksInSameStatus = tasks.filter(
		(t) => String(t.status_id) === statusId,
	);
	if (!tasksInSameStatus.length) return 0;
	const maxOrder = Math.max(...tasksInSameStatus.map((t) => t.order));
	return maxOrder + 1;
};

const getInitialFormData = (
	task?: Task,
	allTasks: Task[] = [],
): TaskFormData => {
	const defaultStatus = "1"; // To Do status
	const defaultPriority = "1"; // Default priority
	const defaultType = "1"; // Default type

	const statusId = task?.status_id ? String(task.status_id) : defaultStatus;
	const nextOrder = getNextOrder(allTasks, statusId);

	return {
		title: task?.title ?? "",
		description: task?.description ?? "",
		status_id: statusId,
		priority_id: task?.priority_id ? String(task.priority_id) : defaultPriority,
		type_id: task?.type_id ? String(task.type_id) : defaultType,
		order: task?.order ?? nextOrder,
		content: {
			description: task?.content?.description ?? "",
			acceptance_criteria: task?.content?.acceptance_criteria ?? [],
			implementation_details: task?.content?.implementation_details ?? "",
			notes: task?.content?.notes ?? "",
			attachments: task?.content?.attachments ?? [],
			due_date: task?.content?.due_date,
			assignee: task?.content?.assignee ?? "",
		},
		relationships: task?.relationships ?? {
			parent: undefined,
			dependencies: [],
			labels: [],
		},
		metadata: {
			created_at: task?.metadata?.created_at ?? new Date().toISOString(),
			updated_at: task?.metadata?.updated_at ?? new Date().toISOString(),
			board: task?.metadata?.board,
			column: task?.metadata?.column,
		},
	};
};

export const TaskForm: FC<TaskFormProps> = ({
	isOpen,
	onClose,
	onSubmit,
	task,
	allTasks,
}) => {
	const [formData, setFormData] = useState<TaskFormData>({
		title: task?.title ?? "",
		description: task?.description ?? "",
		status_id: task?.status_id?.toString() ?? "",
		priority_id: task?.priority_id?.toString() ?? "",
		type_id: task?.type_id?.toString() ?? "",
		order: task?.order ?? 0,
		content: {
			description: task?.content?.description ?? "",
			acceptance_criteria: task?.content?.acceptance_criteria ?? [],
			attachments: task?.content?.attachments ?? [],
		},
		relationships: {
			parent: task?.relationships?.parent ?? undefined,
			dependencies: task?.relationships?.dependencies ?? [],
			labels: task?.relationships?.labels ?? [],
		},
		metadata: {
			created_at: task?.metadata?.created_at ?? new Date().toISOString(),
			updated_at: task?.metadata?.updated_at ?? new Date().toISOString(),
			board: task?.metadata?.board,
			column: task?.metadata?.column,
		},
	});

	// Update form data when task changes
	useEffect(() => {
		setFormData(getInitialFormData(task, allTasks));
	}, [task, allTasks]);

	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate required fields
		if (
			!formData.title ||
			!formData.description ||
			!formData.priority_id ||
			!formData.type_id
		) {
			toast.error("Please fill in all required fields");
			return;
		}

		try {
			setIsLoading(true);
			const { metadata, ...formDataWithoutMetadata } = formData;
			const updatedTask: Partial<Task> = {
				...formDataWithoutMetadata,
				status_id: Number(formData.status_id),
				priority_id: Number(formData.priority_id),
				type_id: Number(formData.type_id),
				content: {
					description: formData.description || "",
					acceptance_criteria: formData.content?.acceptance_criteria || [],
					attachments: formData.content?.attachments || [],
					implementation_details: formData.content?.implementation_details,
					notes: formData.content?.notes,
					due_date: formData.content?.due_date,
					assignee: formData.content?.assignee,
				},
				relationships: {
					...formData.relationships,
					parent: formData.relationships?.parent,
					dependencies: formData.relationships?.dependencies || [],
					labels: formData.relationships?.labels || [],
				},
			};

			await onSubmit(updatedTask);
			toast.success(
				task ? "Task updated successfully" : "Task created successfully",
			);
			onClose();
		} catch (error) {
			console.error("Error submitting task:", error);
			toast.error("Failed to save task");
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading) {
		return (
			<Dialog open={isOpen} onClose={onClose} className="relative z-50">
				<div className="fixed inset-0 bg-black/30" aria-hidden="true" />
				<div className="fixed inset-0 flex items-center justify-center p-4">
					<Dialog.Panel className="mx-auto max-w-xl rounded bg-white p-6">
						<div
							className="flex items-center justify-center"
							data-testid="loading-state"
						>
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
						</div>
					</Dialog.Panel>
				</div>
			</Dialog>
		);
	}

	return (
		<Dialog
			open={isOpen}
			onClose={onClose}
			className="fixed inset-0 z-50 overflow-y-auto"
			data-testid="task-form"
			aria-modal="true"
		>
			<div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
				<Dialog.Overlay className="fixed inset-0 bg-black/30" />
				<Dialog.Panel className="relative w-full transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all sm:my-8 sm:max-w-2xl">
					<div className="flex items-center justify-between">
						<Dialog.Title className="text-lg font-medium" id="task-form-title">
							{task ? "Edit Task" : "Create Task"}
						</Dialog.Title>
						<button
							type="button"
							onClick={onClose}
							className="rounded-full p-1 hover:bg-gray-100"
							aria-label="Close"
						>
							<XMarkIcon className="h-5 w-5" />
						</button>
					</div>

					<form
						onSubmit={handleSubmit}
						className="mt-4 space-y-4"
						aria-busy={isLoading}
						aria-labelledby="task-form-title"
					>
						<div>
							<Input
								id="title"
								label="Title"
								value={formData.title}
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
								required
								data-testid="task-title-input"
								aria-label="Title"
							/>
						</div>

						<div>
							<TextArea
								id="description"
								label="Description"
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								required
								data-testid="task-description-input"
								aria-label="Description"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="priority"
									className="block text-sm font-medium text-gray-700"
								>
									Priority
								</label>
								<select
									id="priority"
									value={formData.priority_id}
									onChange={(e) =>
										setFormData({ ...formData, priority_id: e.target.value })
									}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
									required
									data-testid="task-priority-select"
									aria-required="true"
								>
									<option value="">Select priority...</option>
									{SELECT_OPTIONS.PRIORITY.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</div>

							<div>
								<label
									htmlFor="type"
									className="block text-sm font-medium text-gray-700"
								>
									Type
								</label>
								<select
									id="type"
									value={formData.type_id}
									onChange={(e) =>
										setFormData({ ...formData, type_id: e.target.value })
									}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
									required
									data-testid="task-type-select"
									aria-required="true"
								>
									<option value="">Select type...</option>
									{SELECT_OPTIONS.TYPE.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</div>
						</div>

						<div>
							<Labels
								labels={formData.relationships.labels ?? []}
								onUpdate={(labels) =>
									setFormData({
										...formData,
										relationships: {
											...formData.relationships,
											labels,
										},
									})
								}
							/>
						</div>

						<div>
							<AcceptanceCriteria
								criteria={formData.content.acceptance_criteria}
								onUpdate={(criteria) =>
									setFormData({
										...formData,
										content: {
											...formData.content,
											acceptance_criteria: criteria,
										},
									})
								}
								taskId={task?.id}
							/>
						</div>

						<div className="mt-4 flex justify-end space-x-2">
							<Button
								type="button"
								variant="secondary"
								onClick={onClose}
								aria-label="Cancel"
							>
								Cancel
							</Button>
							<Button type="submit" variant="primary" aria-label="Save Task">
								Save
							</Button>
						</div>
					</form>
				</Dialog.Panel>
			</div>
		</Dialog>
	);
};
