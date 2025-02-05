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
} from "../types";
import type { TaskPriorityId, TaskTypeId } from "../types/typeReference";
import { TaskRelationships as TaskRelationshipsEditor } from "./TaskRelationships";
import { TaskMetadata as TaskMetadataEditor } from "./TaskMetadata";
import { AcceptanceCriteria } from "./AcceptanceCriteria";
import { toast } from "react-hot-toast";
import { taskAPI } from "../api/client";
import { TASK_STATUS, TASK_PRIORITY, TASK_TYPE } from "../types/typeReference";
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

import type {
	TaskStatusId,
	TaskPriority,
	TaskType,
	TaskPriorityEntity,
	TaskTypeEntity,
} from "../types/typeReference";

const API_BASE_URL = "http://localhost:8000/api";

interface TaskFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (task: Partial<Task>) => void;
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
	due_date: "",
	assignee: "",
};

const getNextOrder = (tasks: Task[], statusId: string): number => {
	if (!tasks.length) return 0;
	const tasksInSameStatus = tasks.filter((t) => t.status_id === statusId);
	if (!tasksInSameStatus.length) return 0;
	const maxOrder = Math.max(...tasksInSameStatus.map((t) => t.order));
	return maxOrder + 1;
};

const getInitialFormData = (
	task?: Task,
	allTasks: Task[] = [],
): TaskFormData => {
	// Default values for new tasks
	const defaultStatus = "e8a6ff18-36cd-4bec-be61-97a5cd31fcf9"; // To Do status
	const defaultPriority = "1"; // Default priority as string
	const defaultType = "1"; // Default type as string

	const statusId = task?.status_id || defaultStatus;
	const nextOrder = getNextOrder(allTasks, statusId);

	return {
		title: task?.title ?? "",
		description: task?.description ?? "",
		status_id: statusId,
		priority_id: task?.priority_id?.toString() || defaultPriority,
		type_id: task?.type_id?.toString() || defaultType,
		order: task?.order ?? nextOrder,
		content: task?.content ?? {
			description: "",
			acceptance_criteria: [],
			implementation_details: "",
			notes: "",
			attachments: [],
			due_date: "",
			assignee: "",
		},
		relationships: task?.relationships ?? {
			parent: undefined,
			dependencies: [],
			labels: [],
		},
		metadata: task?.metadata ?? {
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			board: undefined,
			column: undefined,
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
	const [formData, setFormData] = useState<TaskFormData>(() =>
		getInitialFormData(task, allTasks),
	);
	const [priorityOptions, setPriorityOptions] = useState<Option[]>([]);
	const [typeOptions, setTypeOptions] = useState<Option[]>([]);
	const [loading, setLoading] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [taskDetails, setTaskDetails] = useState<TaskDetails | null>(null);

	const loadOptions = useCallback(async () => {
		setLoading(true);
		try {
			const [priorities, types] = await Promise.all([
				taskAPI.listPriorities(),
				taskAPI.listTaskTypes(),
			]);

			const priorityOpts = priorities.map((priority) => ({
				value: String(priority.id),
				label: priority.name || priority.code,
			}));

			const typeOpts = types.map((t) => ({
				value: String(t.id),
				label: t.name,
			}));

			setPriorityOptions(priorityOpts);
			setTypeOptions(typeOpts);
		} catch (error) {
			console.error("Failed to load options:", error);
			toast.error("Failed to load form options");
		} finally {
			setLoading(false);
		}
	}, []);

	// Ensure options are loaded when form opens
	useEffect(() => {
		if (isOpen) {
			loadOptions();
		}
	}, [loadOptions, isOpen]);

	// Wait for options to be loaded
	useEffect(() => {
		if (priorityOptions.length === 0 || typeOptions.length === 0) {
			setLoading(true);
		} else {
			setLoading(false);
		}
	}, [priorityOptions, typeOptions]);

	useEffect(() => {
		if (isOpen) {
			loadOptions();
		}
	}, [loadOptions, isOpen]);

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

	useEffect(() => {
		if (task?.id) {
			fetchTaskDetails(task.id);
		} else {
			// For new tasks, initialize with empty details
			setTaskDetails({
				description: "",
				acceptance_criteria: [],
				implementation_details: "",
				notes: "",
				attachments: [],
				due_date: "",
				assignee: "",
				status_history: [],
			});
			setFormData(getInitialFormData(undefined, allTasks));
			setIsLoading(false);
		}
	}, [task, fetchTaskDetails, allTasks]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const taskData: Partial<Task> = {
				...formData,
				priority_id: Number(formData.priority_id),
				type_id: Number(formData.type_id),
			};
			await onSubmit(taskData);
			onClose();
		} catch (error) {
			console.error("Failed to submit task:", error);
			toast.error("Failed to create task");
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
			status_id: (task.status_id || defaultStatus.id) as TaskStatusId,
			priority_id: (task.priority_id || defaultPriority.id) as TaskPriorityId,
			type_id: (task.type_id || defaultType.id) as TaskTypeId,
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
					{loading || !priorityOptions.length || !typeOptions.length ? (
						<div
							className="flex items-center justify-center p-4"
							aria-label="Loading form options"
						>
							<div
								className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
								role="progressbar"
							/>
						</div>
					) : (
						<>
							<div className="flex items-center justify-between">
								<Dialog.Title
									className="text-lg font-medium"
									id="task-form-title"
								>
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
									<Button
										type="submit"
										variant="primary"
										aria-label="Save Task"
									>
										Save
									</Button>
								</div>
							</form>
						</>
					)}
				</Dialog.Panel>
			</div>
		</Dialog>
	);
};
