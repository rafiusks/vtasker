import type { FC } from "react";
import { useState, useEffect } from "react";
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
import { TaskRelationships as TaskRelationshipsEditor } from "./TaskRelationships";
import { TaskMetadata as TaskMetadataEditor } from "./TaskMetadata";
import { AcceptanceCriteria } from "./AcceptanceCriteria";
import { toast } from "react-hot-toast";

interface TaskFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (task: Task) => void;
	task?: Task;
	allTasks?: Task[];
}

interface TaskFormState {
	title: string;
	description: string;
	status: Task["status"];
	priority: Task["priority"];
	type: Task["type"];
	order: number;
	metadata: {
		created_at: string;
		updated_at: string;
		board?: string;
		column?: string;
	};
	relationships: {
		parent?: string;
		dependencies: string[];
		labels: string[];
	};
	content: {
		description: string;
		acceptance_criteria: Array<{
			id: string;
			description: string;
			order: number;
			completed: boolean;
			completed_at?: string;
			completed_by?: string;
			created_at: string;
			updated_at: string;
			category?: string;
			notes?: string;
		}>;
		implementation_details?: string;
		notes?: string;
		attachments: string[];
		due_date?: string;
		assignee?: string;
	};
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
		status: Task["status"];
		timestamp: string;
	}>;
}

const defaultContent: TaskContent = {
	description: "",
	acceptance_criteria: [],
	implementation_details: "",
	notes: "",
	attachments: [],
};

const getInitialFormState = (): TaskFormState => ({
	title: "",
	description: "",
	status: "backlog",
	priority: "normal",
	type: "feature",
	order: 0,
	metadata: {
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	relationships: {
		dependencies: [],
		labels: [],
	},
	content: {
		description: "",
		acceptance_criteria: [],
		implementation_details: "",
		notes: "",
		attachments: [],
	},
});

const priorityOptions = [
	{ value: "low", label: "Low" },
	{ value: "normal", label: "Normal" },
	{ value: "high", label: "High" },
];

const statusOptions = [
	{ value: "backlog", label: "Backlog" },
	{ value: "in-progress", label: "In Progress" },
	{ value: "review", label: "Review" },
	{ value: "done", label: "Done" },
];

const typeOptions = [
	{ value: "feature", label: "Feature" },
	{ value: "bug", label: "Bug" },
	{ value: "docs", label: "Documentation" },
	{ value: "chore", label: "Chore" },
];

// Helper function to convert null to undefined for string fields
const nullToUndefined = (
	criterion: Partial<AcceptanceCriterion>,
): Partial<AcceptanceCriterion> => ({
	...criterion,
	completed_at:
		criterion.completed_at === null ? undefined : criterion.completed_at,
	completed_by:
		criterion.completed_by === null ? undefined : criterion.completed_by,
	category: criterion.category === null ? undefined : criterion.category,
	notes: criterion.notes === null ? undefined : criterion.notes,
});

const convertCriterion = (
	c: Partial<AcceptanceCriterion>,
): AcceptanceCriterion => ({
	id: c.id || crypto.randomUUID(),
	description: c.description || "",
	order: typeof c.order === "number" ? c.order : 0,
	completed: !!c.completed,
	completed_at: c.completed
		? c.completed_at || new Date().toISOString()
		: undefined,
	completed_by: c.completed ? c.completed_by || "user" : undefined,
	created_at: c.created_at || new Date().toISOString(),
	updated_at: new Date().toISOString(),
	category: c.category === null ? undefined : c.category,
	notes: c.notes === null ? undefined : c.notes,
});

export const TaskForm: FC<TaskFormProps> = ({
	isOpen,
	onClose,
	onSubmit,
	task,
	allTasks = [],
}) => {
	const [formData, setFormData] = useState<TaskFormState>(() => {
		if (!task) return getInitialFormState();

		const defaultContent = getInitialFormState().content;
		return {
			title: task.title,
			description: task.description,
			status: task.status,
			priority: task.priority,
			type: task.type,
			order: task.order,
			metadata: task.metadata,
			relationships: task.relationships,
			content: {
				...defaultContent,
				description: task.content?.description ?? defaultContent.description,
				acceptance_criteria:
					task.content?.acceptance_criteria.map((c) => ({
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
		};
	});
	const [isLoading, setIsLoading] = useState(false);
	const [taskDetails, setTaskDetails] = useState<TaskDetails | null>(null);

	useEffect(() => {
		const loadTaskDetails = async () => {
			if (!task?.id) return;

			try {
				setIsLoading(true);
				const response = await fetch(
					`http://localhost:8000/api/tasks/${task.id}/details`,
				);
				if (!response.ok) {
					throw new Error("Failed to fetch task details");
				}
				const details = await response.json();
				setTaskDetails(details);
				setFormData({
					title: details.title,
					description: details.description,
					status: details.status,
					priority: details.priority,
					type: details.type,
					order: details.order,
					metadata: details.metadata,
					relationships: details.relationships,
					content: {
						description: details.description,
						acceptance_criteria: details.content.acceptance_criteria
							.map((c: AcceptanceCriterion | string, index: number) => {
								console.log(
									"Processing criterion:",
									JSON.stringify(c, null, 2),
								);

								// Handle case where the criterion is a string
								if (typeof c === "string") {
									// Parse the criterion string format: "[x] Description {id: uuid}"
									const completionMatch = c.match(/^\[(x| )\]/);
									const idMatch = c.match(/\{id: ([^}]+)\}$/);

									const completed = completionMatch
										? completionMatch[1] === "x"
										: false;
									const id = idMatch ? idMatch[1].trim() : crypto.randomUUID();

									// Remove the completion status and ID from the description
									const description = c
										.replace(/^\[(x| )\]\s*/, "") // Remove completion status
										.replace(/\s*\{id: [^}]+\}$/, ""); // Remove ID

									return {
										id,
										description: description.trim(),
										order: index,
										completed,
										completed_at: completed
											? new Date().toISOString()
											: undefined,
										completed_by: completed ? "user" : undefined,
										created_at: new Date().toISOString(),
										updated_at: new Date().toISOString(),
									};
								}

								return {
									...c,
									id: c.id || crypto.randomUUID(),
									description: c.description || "",
									order: typeof c.order === "number" ? c.order : index,
									completed: !!c.completed,
									completed_at: c.completed_at || undefined,
									completed_by: c.completed_by || undefined,
									created_at: c.created_at || new Date().toISOString(),
									updated_at: c.updated_at || new Date().toISOString(),
								};
							})
							.filter((c: AcceptanceCriterion) => {
								const description = c?.description?.trim();
								if (!description) {
									console.warn(
										"Filtering out criterion with empty description:",
										c.id,
										"Full criterion:",
										JSON.stringify(c, null, 2),
									);
									return false;
								}
								return true;
							}),
						implementation_details:
							details.content.implementation_details || "",
						notes: details.content.notes || "",
						attachments: details.content.attachments || [],
						due_date: details.content.due_date || undefined,
						assignee: details.content.assignee || undefined,
					},
				});
			} catch (error) {
				console.error("Error loading task details:", error);
				toast.error("Failed to load task details");
			} finally {
				setIsLoading(false);
			}
		};

		if (task?.id) {
			loadTaskDetails();
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
			setIsLoading(false);
		}
	}, [task?.id]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Clean and validate dependencies
		const cleanDependencies = formData.relationships.dependencies
			.map((dep) => {
				const match = dep.match(/^(task-\d{3}(-\d{1,2})?)/);
				return match ? match[1] : null;
			})
			.filter((dep): dep is string => {
				if (!dep) return false;
				// Ensure the dependency exists in allTasks
				return allTasks?.some((t) => t.id === dep) ?? false;
			});

		const now = new Date().toISOString();

		// Clean and deduplicate acceptance criteria
		const uniqueCriteria = new Map();
		for (const criterion of formData.content.acceptance_criteria) {
			const description =
				typeof criterion.description === "string"
					? criterion.description.trim()
					: "";

			if (!description) continue;

			// If we already have this criterion (by ID), keep the most recent one
			if (uniqueCriteria.has(criterion.id)) {
				const existing = uniqueCriteria.get(criterion.id);
				if (new Date(criterion.updated_at) > new Date(existing.updated_at)) {
					uniqueCriteria.set(criterion.id, criterion);
				}
			} else {
				uniqueCriteria.set(criterion.id, {
					...criterion,
					id: criterion.id || crypto.randomUUID(),
					description,
					order: criterion.order ?? uniqueCriteria.size,
					completed: !!criterion.completed,
					completed_at: criterion.completed
						? criterion.completed_at || now
						: null,
					completed_by: criterion.completed
						? criterion.completed_by || "user"
						: null,
					created_at: criterion.created_at || now,
					updated_at: now,
				});
			}
		}

		const submitData: Partial<Task> = {
			...formData,
			title: formData.title.trim(),
			description: formData.description.trim(),
			order: formData.order,
			metadata: formData.metadata,
			relationships: {
				...formData.relationships,
				dependencies: cleanDependencies,
			},
			content: {
				...formData.content,
				description: formData.description.trim(),
				acceptance_criteria: Array.from(uniqueCriteria.values()),
				implementation_details:
					formData.content.implementation_details?.trim() || undefined,
				notes: formData.content.notes?.trim() || undefined,
				attachments: formData.content.attachments,
				due_date: formData.content.due_date || undefined,
				assignee: formData.content.assignee || undefined,
			},
		};

		// Remove any undefined values to prevent undefined tags
		for (const key of Object.keys(submitData)) {
			if (submitData[key as keyof typeof submitData] === undefined) {
				delete submitData[key as keyof typeof submitData];
			}
		}

		console.log(
			"Submitting task with data:",
			JSON.stringify(submitData, null, 2),
		);
		onSubmit(submitData as Task);
		onClose();
	};

	const openEditForm = (task: Task) => {
		const defaultContent = getInitialFormState().content;
		setFormData({
			title: task.title,
			description: task.description,
			status: task.status,
			priority: task.priority,
			type: task.type,
			order: task.order,
			metadata: task.metadata,
			relationships: task.relationships,
			content: {
				...defaultContent,
				description: task.content?.description ?? defaultContent.description,
				acceptance_criteria:
					task.content?.acceptance_criteria.map((c) => ({
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
		});
	};

	const handleAcceptanceCriteriaUpdate = (criteria: AcceptanceCriterion[]) => {
		setFormData((prev) => ({
			...prev,
			content: {
				...prev.content,
				acceptance_criteria: criteria.map((c) => ({
					...nullToUndefined(c),
					id: c.id || crypto.randomUUID(),
					description: c.description || "",
					order: typeof c.order === "number" ? c.order : 0,
					completed: !!c.completed,
					completed_at: c.completed
						? c.completed_at || new Date().toISOString()
						: undefined,
					completed_by: c.completed ? c.completed_by || "user" : undefined,
					created_at: c.created_at || new Date().toISOString(),
					updated_at: new Date().toISOString(),
				})),
			},
		}));
	};

	return (
		<Dialog open={isOpen} onClose={onClose} className="relative z-50">
			{/* Backdrop */}
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

			{/* Full-screen container */}
			<div className="fixed inset-0 flex items-center justify-center p-4">
				<Dialog.Panel className="mx-auto max-w-4xl w-full rounded-lg bg-white p-6 shadow-xl">
					<div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
						<Dialog.Title className="text-lg font-semibold text-gray-900">
							{task ? "Edit Task" : "Create New Task"}
						</Dialog.Title>
						<button
							type="button"
							onClick={onClose}
							className="text-gray-400 hover:text-gray-500"
						>
							<XMarkIcon className="h-5 w-5" aria-hidden="true" />
						</button>
					</div>

					<div className="mt-4 grid grid-cols-3 gap-6">
						<form className="col-span-2 space-y-4" onSubmit={handleSubmit}>
							{/* Title */}
							<div>
								<label
									htmlFor="title"
									className="block text-sm font-medium text-gray-700"
								>
									Title
								</label>
								<input
									type="text"
									id="title"
									value={formData.title}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, title: e.target.value }))
									}
									className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
									placeholder="Enter task title"
									required
								/>
							</div>

							{/* Description */}
							<div>
								<label
									htmlFor="description"
									className="block text-sm font-medium text-gray-700"
								>
									Description
								</label>
								<textarea
									id="description"
									value={formData.description}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											description: e.target.value,
										}))
									}
									rows={3}
									className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
									placeholder="Enter task description"
									required
								/>
							</div>

							{/* Status, Priority, and Type */}
							<div className="grid grid-cols-3 gap-4">
								<Select
									label="Status"
									value={formData.status}
									onChange={(value) => {
										if (
											value === "backlog" ||
											value === "in-progress" ||
											value === "review" ||
											value === "done"
										) {
											setFormData((prev) => ({ ...prev, status: value }));
										}
									}}
									options={statusOptions}
								/>
								<Select
									label="Priority"
									value={formData.priority}
									onChange={(value) => {
										if (
											value === "low" ||
											value === "normal" ||
											value === "high"
										) {
											setFormData((prev) => ({ ...prev, priority: value }));
										}
									}}
									options={priorityOptions}
								/>
								<Select
									label="Type"
									value={formData.type}
									onChange={(value) => {
										if (
											value === "feature" ||
											value === "bug" ||
											value === "docs" ||
											value === "chore"
										) {
											setFormData((prev) => ({ ...prev, type: value }));
										}
									}}
									options={typeOptions}
								/>
							</div>

							{/* Acceptance Criteria */}
							<div>
								<h3 className="text-sm font-medium text-gray-900 mb-3">
									Acceptance Criteria
								</h3>
								<AcceptanceCriteria
									criteria={formData.content.acceptance_criteria}
									taskId={task?.id}
									onUpdate={handleAcceptanceCriteriaUpdate}
								/>
							</div>

							{/* Submit Button */}
							<div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
								<button
									type="button"
									onClick={onClose}
									className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
								>
									{task ? "Save Changes" : "Create Task"}
								</button>
							</div>
						</form>

						{/* Right Column - Metadata and Relationships */}
						{task && (
							<div className="col-span-1 space-y-6">
								{/* Metadata Section */}
								<div>
									<h3 className="text-sm font-medium text-gray-900 mb-3">
										Metadata
									</h3>
									<TaskMetadataEditor
										task={{
											...task,
											content: formData.content,
										}}
										onUpdate={(updates) => {
											setFormData((prev) => ({
												...prev,
												...updates,
												content: {
													...prev.content,
													...updates.content,
												},
											}));
										}}
									/>
								</div>

								{/* Relationships Section */}
								<div>
									<h3 className="text-sm font-medium text-gray-900 mb-3">
										Relationships
									</h3>
									<TaskRelationshipsEditor
										task={task}
										allTasks={allTasks}
										onTaskClick={(taskId) => {
											const targetTask = allTasks.find((t) => t.id === taskId);
											if (targetTask) {
												onClose();
												setTimeout(() => {
													openEditForm(targetTask);
												}, 100);
											}
										}}
									/>
								</div>
							</div>
						)}
					</div>
				</Dialog.Panel>
			</div>
		</Dialog>
	);
};
