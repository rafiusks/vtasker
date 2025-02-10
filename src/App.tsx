import React, { useState, useEffect, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PlusIcon } from "@heroicons/react/20/solid";
import { TaskForm } from "./components/TaskForm";
import { TaskColumn } from "./components/TaskColumn";
import { Select, type Option } from "./components/Select";
import type { Task, RawTask } from "./types";
import {
	TASK_STATUS,
	SELECT_OPTIONS,
	STATUS_MAP,
	isTaskStatusId,
	type TaskStatusId,
	type TaskStatusUIType,
	initializeTaskStatuses,
	updateStatusMap,
} from "./types/typeReference";
import { StatusNotification } from "./components/StatusNotification";
import { toast } from "react-hot-toast";
import { taskAPI } from "./api/client";
import type { TaskMoveRequest } from "./api/client";
import {
	ensureValidStatusId,
	ensureValidPriorityId,
	ensureValidTypeId,
	convertArrayToStrings,
	createTaskUpdateRequest,
} from "./utils/typeConverters";
import { ensureTaskArray } from "./utils/apiTypes";

// ============================================================================
// Types
// ============================================================================

type SortByField = "created_at" | "priority_id";
type SortOrder = "asc" | "desc";

interface FilterState {
	status: string[];
	priority: string[];
	labels: string[];
	sortBy: SortByField;
	sortOrder: SortOrder;
}

interface NotificationState {
	show: boolean;
	taskTitle?: string;
	status?: TaskStatusUIType;
}

// ============================================================================
// Constants
// ============================================================================

const defaultFilters: FilterState = {
	status: [],
	priority: [],
	labels: [],
	sortBy: "created_at",
	sortOrder: "desc",
};

const sortOptions: Option[] = [
	{ value: "created_at", label: "Creation Date" },
	{ value: "priority_id", label: "Priority" },
];

const sortOrderOptions: Option[] = [
	{ value: "asc", label: "↑" },
	{ value: "desc", label: "↓" },
];

// ============================================================================
// Component
// ============================================================================

export function App() {
	// ============================================================================
	// State
	// ============================================================================
	const [tasks, setTasks] = useState<Task[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [filtersLoading, setFiltersLoading] = useState(true);
	const [filters, setFilters] = useState<FilterState>(defaultFilters);
	const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<Task>();
	const [notification, setNotification] = useState<NotificationState>({
		show: false,
	});
	const [statusesLoaded, setStatusesLoaded] = useState(false);

	// ============================================================================
	// Effects
	// ============================================================================

	// Load task statuses and tasks
	useEffect(() => {
		async function initialize() {
			try {
				// First load statuses
				const statuses = await taskAPI.listStatuses();
				await initializeTaskStatuses(statuses);
				updateStatusMap();
				setStatusesLoaded(true);

				// Then load tasks
				await loadTasks();
			} catch (error) {
				console.error("Failed to initialize:", error);
				setError("Failed to load task statuses");
			}
		}

		initialize();
	}, []);

	// Load filters from URL on mount
	useEffect(() => {
		const params = new URLSearchParams(globalThis.location.search);
		const urlFilters: Partial<FilterState> = {};

		// Parse array parameters
		const arrayParams = ["status", "priority", "labels"] as const;
		for (const key of arrayParams) {
			const value = params.get(key);
			if (value) {
				const values = value.split(",");
				if (key === "status") {
					const validStatuses = values.filter((v) =>
						["backlog", "in-progress", "review", "done"].includes(v),
					);
					if (validStatuses.length > 0) {
						urlFilters.status = validStatuses;
					}
				} else if (key === "priority") {
					const validPriorities = values.filter((v) =>
						["1", "2", "3"].includes(v),
					);
					if (validPriorities.length > 0) {
						urlFilters.priority = validPriorities;
					}
				} else if (key === "labels") {
					urlFilters.labels = values;
				}
			}
		}

		// Parse single value parameters
		const sortBy = params.get("sortBy");
		if (sortBy === "created_at" || sortBy === "priority_id") {
			urlFilters.sortBy = sortBy;
		}

		const sortOrder = params.get("sortOrder");
		if (sortOrder === "asc" || sortOrder === "desc") {
			urlFilters.sortOrder = sortOrder;
		}

		setFilters((prev) => ({ ...prev, ...urlFilters }));
		setFiltersLoading(false);
	}, []);

	// Update URL when filters change
	useEffect(() => {
		if (filtersLoading) return;

		const params = new URLSearchParams();

		// Only add non-empty array filters to URL
		for (const [key, value] of Object.entries(filters)) {
			if (Array.isArray(value) && value.length > 0) {
				params.set(key, value.join(","));
			} else if (!Array.isArray(value)) {
				params.set(key, value);
			}
		}

		const newUrl = params.toString()
			? `${globalThis.location.pathname}?${params.toString()}`
			: globalThis.location.pathname;

		globalThis.history.replaceState({}, "", newUrl);
	}, [filters, filtersLoading]);

	// ============================================================================
	// Data Loading
	// ============================================================================

	const loadTasks = useCallback(async () => {
		console.log("Loading tasks...");
		setLoading(true);
		try {
			// Add a small delay to ensure the loading state is visible
			await new Promise((resolve) => setTimeout(resolve, 100));
			const loadedTasks = await taskAPI.listTasks();
			console.log("Loaded tasks:", loadedTasks);
			setTasks(loadedTasks);
			setError(null);
		} catch (error) {
			console.error("Error loading tasks:", error);
			setError("Failed to load tasks. Please try again later.");
		} finally {
			setLoading(false);
		}
	}, []);

	// ============================================================================
	// Task Filtering and Sorting
	// ============================================================================

	const filteredTasks = React.useMemo(() => {
		return (tasks || [])
			.filter((task) => {
				// Status filter
				if (filters.status.length) {
					if (
						!task.status_id ||
						!filters.status.includes(String(task.status_id))
					) {
						return false;
					}
				}

				// Priority filter
				if (
					filters.priority.length &&
					!filters.priority.includes(String(task.priority_id))
				) {
					return false;
				}

				// Labels filter
				if (
					filters.labels.length &&
					!task.relationships?.labels?.some((label) =>
						filters.labels.includes(label),
					)
				) {
					return false;
				}

				return true;
			})
			.sort((a, b) => {
				const getValue = (task: Task) => {
					switch (filters.sortBy) {
						case "created_at":
							return new Date(task.metadata.created_at).getTime();
						case "priority_id":
							return Number(task.priority_id);
						default:
							return new Date(task.metadata.created_at).getTime();
					}
				};

				const aValue = getValue(a);
				const bValue = getValue(b);

				return filters.sortOrder === "asc" ? aValue - bValue : bValue - aValue;
			});
	}, [tasks, filters]);

	// ============================================================================
	// Task Operations
	// ============================================================================

	const handleTaskMove = async (
		taskId: string,
		newStatusId: TaskStatusId,
		newIndex?: number,
	) => {
		const originalTasks = [...tasks];

		try {
			const taskToUpdate = tasks.find((t) => t.id === taskId);
			if (!taskToUpdate) throw new Error("Task not found");

			// Get target status
			const targetStatus = STATUS_MAP.get(newStatusId);
			if (!targetStatus) throw new Error("Invalid status ID");

			// Calculate new order
			const tasksInTargetColumn = tasks.filter(
				(t) => isTaskStatusId(t.status_id) && t.status_id === newStatusId,
			);
			const newOrder =
				typeof newIndex === "number" ? newIndex : tasksInTargetColumn.length;

			// Create optimistic task version for UI
			const optimisticTask: Task = {
				...taskToUpdate,
				status_id: newStatusId,
				order: newOrder,
			};

			// Immediately update UI state
			setTasks((prev) => {
				const filtered = prev.filter((t) => t.id !== taskId);
				const insertIndex = filtered.findIndex(
					(t) => t.status_id === newStatusId && t.order >= newOrder,
				);

				const newTasks = [
					...filtered.slice(0, insertIndex),
					optimisticTask,
					...filtered.slice(insertIndex),
				];

				// Recalculate orders for target column
				return newTasks.map((t) =>
					t.status_id === newStatusId
						? { ...t, order: newTasks.indexOf(t) }
						: t,
				);
			});

			// Send move request to server
			const moveRequest: TaskMoveRequest = {
				status_id: newStatusId,
				order: newOrder,
				previous_status_id: taskToUpdate.status_id,
				comment: `Task moved to ${targetStatus.label}`,
				type: taskToUpdate.type?.code || "feature",
			};

			const updatedTask = await taskAPI.moveTask(taskId, moveRequest);

			// Only update if server returns valid response
			if (updatedTask?.id) {
				setTasks((prev) =>
					prev.map((t) => (t.id === taskId ? updatedTask : t)),
				);

				// Show notification
				setNotification({
					show: true,
					taskTitle: updatedTask.title,
					status: targetStatus,
				});
			}
		} catch (err) {
			console.error("Move failed:", err);
			setTasks(originalTasks);
			toast.error("Failed to move task. Changes reverted.");
		}
	};

	const handleCreateTask = async (task: Partial<RawTask>) => {
		try {
			setLoading(true);
			const { metadata, ...taskWithoutMetadata } = task;
			const newTask = await taskAPI.createTask({
				...taskWithoutMetadata,
				order: tasks.length,
				content: {
					description: task.content?.description || "",
					acceptance_criteria: task.content?.acceptance_criteria || [],
					implementation_details: task.content?.implementation_details,
					notes: task.content?.notes,
					attachments: task.content?.attachments || [],
					due_date: task.content?.due_date,
					assignee: task.content?.assignee,
				},
				relationships: {
					parent: task.relationships?.parent || undefined,
					dependencies: task.relationships?.dependencies || [],
					labels: task.relationships?.labels || [],
				},
			});
			setTasks((prev) => [...prev, newTask]);
			setIsTaskFormOpen(false);
			toast.success("Task created successfully");
			return newTask;
		} catch (err) {
			console.error("Failed to create task:", err);
			toast.error(err instanceof Error ? err.message : "Failed to create task");
			throw err;
		} finally {
			setLoading(false);
		}
	};

	const handleEditTask = async (taskId: string, updates: Partial<Task>) => {
		if (!taskId) return;

		try {
			const existingTask = tasks.find((t) => t.id === taskId);
			if (!existingTask) {
				throw new Error("Task not found");
			}

			const updateRequest = createTaskUpdateRequest(updates, existingTask);
			const updatedTask = await taskAPI.updateTask(taskId, updateRequest);

			// Update the tasks list immediately
			setTasks((prevTasks) => {
				const index = prevTasks.findIndex((t) => t.id === taskId);
				if (index === -1) return prevTasks;
				const newTasks = [...prevTasks];
				newTasks[index] = updatedTask;
				return newTasks;
			});

			// Close the form
			// Update the tasks list with the new task and wait for the state to be updated
			await new Promise<void>((resolve) => {
				setTasks((prevTasks) => {
					const index = prevTasks.findIndex((t) => t.id === taskId);
					if (index === -1) return prevTasks;
					const newTasks = [...prevTasks];
					newTasks[index] = updatedTask;
					return newTasks;
				});
				// Give React a chance to update the state
				setTimeout(resolve, 0);
			});

			// Close the form after state is updated
			setIsTaskFormOpen(false);
			toast.success("Task updated successfully");
		} catch (err) {
			console.error("Failed to update task:", err);
			toast.error(err instanceof Error ? err.message : "Failed to update task");
		}
	};

	const handleDeleteTask = async (taskId: string) => {
		try {
			// Delete from backend
			await taskAPI.deleteTask(taskId);

			// Update state and wait for both state and DOM updates
			await new Promise<void>((resolve) => {
				setTasks((prev) => {
					const newTasks = prev.filter((task) => task.id !== taskId);
					// Use requestAnimationFrame to ensure DOM has been updated
					requestAnimationFrame(() => {
						// Add another frame to ensure the browser has painted
						requestAnimationFrame(() => {
							resolve();
						});
					});
					return newTasks;
				});
			});

			toast.success("Task deleted successfully");
		} catch (err) {
			console.error("Failed to delete task:", err);
			toast.error(err instanceof Error ? err.message : "Failed to delete task");
		}
	};

	// ============================================================================
	// Event Handlers
	// ============================================================================

	const handleTaskClick = (task: Task) => {
		setEditingTask(task);
		setIsTaskFormOpen(true);
	};

	const handleTaskSubmit = (task: Partial<Task>) => {
		if (editingTask) {
			handleEditTask(editingTask.id, task);
		} else {
			// Convert Task to RawTask format
			const { metadata, ...taskWithoutMetadata } = task;
			const rawTask: Partial<RawTask> = {
				...taskWithoutMetadata,
				status_id: Number(task.status_id),
				priority_id: Number(task.priority_id),
				type_id: Number(task.type_id),
				content: {
					...task.content,
					description: task.content?.description || "",
					acceptance_criteria: task.content?.acceptance_criteria || [],
					attachments: task.content?.attachments || [],
				},
				relationships: {
					parent: task.relationships?.parent || undefined,
					dependencies: task.relationships?.dependencies || [],
					labels: task.relationships?.labels || [],
				},
				progress: {
					acceptance_criteria: {
						total: task.content?.acceptance_criteria?.length || 0,
						completed: 0,
					},
					percentage: 0,
				},
			};
			handleCreateTask(rawTask);
		}
	};

	const handleFilterChange = (
		type: keyof FilterState,
		value: string | string[],
	) => {
		setFilters((prev) => {
			const newFilters = { ...prev };
			if (Array.isArray(value)) {
				if (type === "status" || type === "priority" || type === "labels") {
					newFilters[type] = value;
				}
			} else {
				if (type === "sortBy") {
					newFilters.sortBy = value as SortByField;
				} else if (type === "sortOrder") {
					newFilters.sortOrder = value as SortOrder;
				}
			}
			return newFilters;
		});
	};

	const clearFilters = () => {
		setFilters(defaultFilters);
	};

	// ============================================================================
	// Computed Values
	// ============================================================================

	const activeFilterCount = React.useMemo(
		() =>
			filters.status.length + filters.priority.length + filters.labels.length,
		[filters],
	);

	const uniqueLabels = React.useMemo(
		() => Array.from(new Set(tasks.flatMap((t) => t.relationships.labels))),
		[tasks],
	);

	// ============================================================================
	// Loading and Error States
	// ============================================================================

	const loadingState = (
		<div
			data-testid="loading-state"
			className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center"
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				opacity: loading || filtersLoading ? 1 : 0,
				visibility: loading || filtersLoading ? "visible" : "hidden",
				transition: "opacity 0.2s, visibility 0.2s",
			}}
		>
			<div className="flex flex-col items-center space-y-4">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
				<div className="text-gray-500">Loading...</div>
			</div>
		</div>
	);

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
				<div className="text-center" data-testid="error-state">
					<div className="text-red-500 mb-4">⚠️</div>
					<p className="text-gray-600">{error}</p>
				</div>
			</div>
		);
	}

	if (!statusesLoaded) {
		return (
			<div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
				<div className="flex flex-col items-center space-y-4">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
					<div className="text-gray-500">Loading task statuses...</div>
				</div>
			</div>
		);
	}

	// ============================================================================
	// Render
	// ============================================================================

	return (
		<DndProvider backend={HTML5Backend}>
			{loadingState}
			<div
				className="min-h-screen bg-gray-50 p-4 md:p-6"
				data-testid="task-list"
				style={{ visibility: loading || filtersLoading ? "hidden" : "visible" }}
			>
				<header className="max-w-7xl mx-auto mb-8">
					<div className="flex items-center justify-between mb-4">
						<div>
							<h1 className="text-4xl font-bold text-gray-900 mb-2">
								vTask Board
							</h1>
							<p className="text-lg text-gray-600">
								Manage your tasks with ease
							</p>
						</div>
						<button
							type="button"
							onClick={() => setIsTaskFormOpen(true)}
							className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
							aria-label="Create Task"
						>
							<PlusIcon className="h-5 w-5" aria-hidden="true" />
							Create Task
						</button>
					</div>
				</header>

				{/* Filter Controls */}
				<div className="max-w-7xl mx-auto mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
					<div className="flex items-center justify-between mb-3">
						<h2 className="text-base font-medium text-gray-900">Filters</h2>
						{activeFilterCount > 0 && (
							<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
								{activeFilterCount} active filter
								{activeFilterCount !== 1 ? "s" : ""}
							</span>
						)}
					</div>
					<div className="space-y-2">
						<div className="flex flex-wrap items-start gap-4">
							{/* Status & Priority Filters */}
							<div className="flex items-start gap-4">
								<Select
									label="Status"
									value={filters.status}
									onChange={(value) => {
										if (typeof value === "string") {
											handleFilterChange("status", [value]);
										} else {
											handleFilterChange("status", value);
										}
									}}
									options={SELECT_OPTIONS.STATUS}
								/>
								<Select
									label="Priority"
									value={filters.priority}
									onChange={(value) => {
										if (typeof value === "string") {
											handleFilterChange("priority", [value]);
										} else {
											handleFilterChange("priority", value);
										}
									}}
									options={SELECT_OPTIONS.PRIORITY}
								/>
							</div>

							{/* Labels Filter */}
							<Select
								label="Labels"
								value={filters.labels}
								onChange={(value) => {
									if (typeof value === "string") {
										handleFilterChange("labels", [value]);
									} else {
										handleFilterChange("labels", value);
									}
								}}
								options={uniqueLabels.map((label) => ({
									value: label,
									label,
								}))}
							/>

							{/* Sort Controls */}
							<div className="flex items-start gap-2">
								<Select
									label="Sort By"
									value={filters.sortBy}
									onChange={(value) => {
										if (typeof value === "string") {
											handleFilterChange("sortBy", value);
										}
									}}
									options={sortOptions}
								/>
								<Select
									label="Sort Order"
									value={filters.sortOrder}
									onChange={(value) => {
										if (typeof value === "string") {
											handleFilterChange("sortOrder", value);
										}
									}}
									options={sortOrderOptions}
								/>
							</div>
						</div>

						{/* Clear Filters */}
						{activeFilterCount > 0 && (
							<div className="flex justify-end pt-2">
								<button
									type="button"
									onClick={clearFilters}
									className="text-sm text-gray-500 hover:text-gray-700"
								>
									Clear Filters
								</button>
							</div>
						)}
					</div>
				</div>

				<main className="max-w-7xl mx-auto">
					<div
						className="grid grid-cols-1 md:grid-cols-4 gap-4"
						data-testid="task-list"
					>
						{error ? (
							<div
								className="col-span-4 text-center py-12"
								data-testid="error-state"
							>
								<p className="text-red-500">{error}</p>
							</div>
						) : filteredTasks.length === 0 ? (
							<div
								className="col-span-4 text-center py-12"
								data-testid="empty-state"
							>
								<p className="text-gray-500">No tasks found</p>
							</div>
						) : (
							Object.values(TASK_STATUS).map((status) => {
								// Filter tasks for this column
								const tasksInColumn = filteredTasks.filter((task) => {
									// If status_id is already a TaskStatusId, use it directly
									if (isTaskStatusId(task.status_id)) {
										return task.status_id === status.id;
									}

									// Otherwise, try to convert it
									const taskStatusId = task.status_id;
									return taskStatusId === status.id;
								});

								return (
									<TaskColumn
										key={status.columnId}
										status={status}
										tasks={tasksInColumn}
										onDrop={handleTaskMove}
										onEdit={handleEditTask}
										onDelete={handleDeleteTask}
										onTaskClick={handleTaskClick}
									/>
								);
							})
						)}
					</div>
				</main>

				{/* Task Form - used for create/edit/view */}
				<TaskForm
					isOpen={isTaskFormOpen}
					onClose={() => {
						setIsTaskFormOpen(false);
						setEditingTask(undefined);
					}}
					onSubmit={handleTaskSubmit}
					task={editingTask}
					allTasks={tasks}
				/>
				<StatusNotification
					show={notification.show}
					onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
					taskTitle={notification.taskTitle ?? ""}
					status={notification.status}
				/>
			</div>
		</DndProvider>
	);
}
