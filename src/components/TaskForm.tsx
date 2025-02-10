import type { FC } from "react";
import { useState, useEffect, useCallback } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { Select } from "./Select";
import type {
	Task,
	TaskMetadata,
	TaskContent,
	TaskRelationships,
	AcceptanceCriterion,
	RawTask,
} from "../types";
import {
	TASK_STATUS,
	TASK_PRIORITY,
	TASK_TYPE,
	type TaskStatusId,
	type TaskPriorityId,
	type TaskTypeId,
	type TaskPriorityEntity,
	type TaskTypeEntity,
} from "../types/typeReference";
import { TaskRelationships as TaskRelationshipsEditor } from "./TaskRelationships";
import { TaskMetadata as TaskMetadataEditor } from "./TaskMetadata";
import { AcceptanceCriteria } from "./AcceptanceCriteria";
import { toast } from "react-hot-toast";
import { taskAPI } from "../api/client";
import { Input } from "./Input";
import { TextArea } from "./TextArea";
import { Button } from "./Button";
import {
	getTaskStatus,
	getTaskPriority,
	getTaskType,
	isTaskStatusId,
} from "../types/typeReference";
import {
	ensureValidPriorityId,
	ensureValidTypeId,
	createTaskUpdateRequest,
} from "../utils/typeConverters";

const API_BASE_URL = "http://localhost:8000/api";

interface TaskFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (task: Partial<RawTask>) => void;
	task?: Task;
	allTasks: Task[];
}

interface Option {
	value: string;
	label: string;
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

interface TaskDetails {
	description: string;
	acceptance_criteria: Array<{
		description: string;
		completed: boolean;
		id: string;
	}>;
	implementation_details?: string;
	notes?: string;
	attachments?: string[];
	due_date?: string;
	assignee?: string;
	status_history?: Array<{
		status_id: number;
		timestamp: string;
	}>;
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
	// Default values for new tasks
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
		content: task?.content ?? {
			description: "",
			acceptance_criteria: [],
			implementation_details: "",
			notes: "",
			attachments: [],
			due_date: undefined,
			assignee: "",
		},
		relationships: task?.relationships ?? {
			parent: undefined,
			dependencies: [],
			labels: [],
		},
		metadata: task?.metadata
			? {
					board: task.metadata.board,
					column: task.metadata.column,
				}
			: undefined,
	};
};

export const TaskForm: FC<TaskFormProps> = ({
	isOpen,
	onClose,
	onSubmit,
	task,
	allTasks,
}) => {
	const [formData, setFormData] = useState<TaskFormData>(() =>
		getInitialFormData(task, allTasks),
	);
	const [priorityOptions, setPriorityOptions] = useState<Option[]>([]);
	const [typeOptions, setTypeOptions] = useState<Option[]>([]);
	const [loading, setLoading] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [taskDetails, setTaskDetails] = useState<TaskDetails | null>(null);

	const fetchTaskDetails = useCallback(
		async (taskId: string) => {
			setIsLoading(true);
			try {
				const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`);
				if (!response.ok) {
					throw new Error("Failed to fetch task details");
				}
				const details = await response.json();

				// Ensure we have all required fields
				const fullTask = {
					...task,
					...details,
					content: {
						...details.content,
						acceptance_criteria: details.content?.acceptance_criteria ?? [],
					},
				};

				setTaskDetails(fullTask);
				setFormData(getInitialFormData(fullTask, allTasks));
			} catch (error) {
				console.error("Error fetching task details:", error);
				toast.error("Failed to load task details");
			} finally {
				setIsLoading(false);
			}
		},
		[task, allTasks],
	);

	const loadOptions = useCallback(async () => {
		setLoading(true);
		try {
			const [priorities, types] = await Promise.all([
				taskAPI.listPriorities(),
				taskAPI.listTaskTypes(),
			]);

			setPriorityOptions(
				priorities.map((priority) => ({
					value: String(priority.id),
					label: priority.name,
				})),
			);

			setTypeOptions(
				types.map((type) => ({
					value: String(type.id),
					label: type.name,
				})),
			);
		} catch (error) {
			console.error("Failed to load options:", error);
			toast.error("Failed to load form options");
		} finally {
			setLoading(false);
		}
	}, []);

	// Load options when form opens
	useEffect(() => {
		if (isOpen) {
			loadOptions();
			if (task?.id) {
				fetchTaskDetails(task.id);
			}
		}
	}, [isOpen, loadOptions, task?.id, fetchTaskDetails]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (loading || isLoading) return;

		// Validate required fields
		if (
			!formData.title ||
			!formData.description ||
			!formData.priority_id ||
			!formData.type_id
		) {
			toast.error("Please fill in all required fields");
			return; // Return early to keep dialog open
		}

		try {
			setIsLoading(true);
			const { metadata, ...formDataWithoutMetadata } = formData;
			const updatedTask: Partial<RawTask> = {
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
					parent: formData.relationships?.parent || undefined,
					dependencies: formData.relationships?.dependencies || [],
					labels: formData.relationships?.labels || [],
				},
			};

			// Wait for the task to be saved
			await onSubmit(updatedTask);
			toast.success(
				task ? "Task updated successfully" : "Task created successfully",
			);

			// Close the form
			onClose();
		} catch (error) {
			console.error("Error submitting task:", error);
			toast.error("Failed to save task");
		} finally {
			setIsLoading(false);
		}
	};

	const handlePriorityChange = (value: string | string[]) => {
		if (Array.isArray(value)) return;
		setFormData((prev) => ({
			...prev,
			priority_id: value,
		}));
	};

	const handleTypeChange = (value: string | string[]) => {
		if (Array.isArray(value)) return;
		setFormData((prev) => ({
			...prev,
			type_id: value,
		}));
	};

	const openEditForm = (task: Task) => {
		const defaultStatus = TASK_STATUS.BACKLOG;
		const defaultPriority = TASK_PRIORITY.NORMAL;
		const defaultType = TASK_TYPE.FEATURE;

		setFormData({
			title: task.title,
			description: task.description,
			status_id: String(task.status_id || defaultStatus.id),
			priority_id: String(task.priority_id || defaultPriority.id),
			type_id: String(task.type_id || defaultType.id),
			order: task.order || 0,
			content: {
				...defaultContent,
				description: task.content?.description ?? defaultContent.description,
				acceptance_criteria:
					task.content?.acceptance_criteria.map((c: AcceptanceCriterion) => ({
						id: c.id || crypto.randomUUID(),
						description: c.description || "",
						order: typeof c.order === "number" ? c.order : 0,
						completed: !!c.completed,
						completed_at: c.completed_at || undefined,
						completed_by: c.completed_by || undefined,
						created_at: c.created_at || new Date().toISOString(),
						updated_at: c.updated_at || new Date().toISOString(),
						category: c.category || undefined,
						notes: c.notes || undefined,
					})) ?? defaultContent.acceptance_criteria,
				implementation_details: task.content?.implementation_details,
				notes: task.content?.notes,
				attachments: task.content?.attachments ?? defaultContent.attachments,
				due_date: task.content?.due_date,
				assignee: task.content?.assignee,
			},
			relationships: task.relationships || {
				dependencies: [],
				labels: [],
			},
			metadata: task.metadata || {
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			},
		});
	};

	const handleAcceptanceCriteriaUpdate = (criteria: AcceptanceCriterion[]) => {
		setFormData((prev) => ({
			...prev,
			content: {
				...prev.content,
				acceptance_criteria: criteria,
			},
		}));
	};

	const handleInputChange = (field: string, value: number | string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	if (loading || isLoading) {
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
						aria-busy={loading}
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

						<div>
							<Select
								id="priority"
								label="Task Priority"
								value={formData.priority_id}
								onChange={handlePriorityChange}
								options={priorityOptions}
								data-testid="task-priority-select"
								required
							/>
						</div>

						<div>
							<Select
								id="type"
								label="Type"
								value={formData.type_id}
								onChange={handleTypeChange}
								options={typeOptions}
								required
								data-testid="task-type-select"
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
