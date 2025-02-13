import React, { useState, useEffect } from "react";
import { TaskForm } from "./components/TaskForm";
import { TaskColumn } from "./components/TaskColumn";
import { Select } from "./components/Select";
import type { Task } from "./types";
import type { Option } from "./components/Select";
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
import { toast, Toaster } from "react-hot-toast";
import { PlusIcon } from "@heroicons/react/20/solid";
import { useTaskQueries } from "./hooks/useTaskQueries";
import { taskAPI } from "./api/client";
import { useQueryClient } from "@tanstack/react-query";
import { Header } from "./components/common/Header";
import { useAuth } from "./contexts/auth/context";
import { useNavigate } from "@tanstack/react-router";

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

interface AppLayoutProps {
	children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
	return (
		<div className="min-h-screen bg-gray-100">
			<Header />
			<main className="py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
			</main>
			<Toaster position="bottom-right" />
		</div>
	);
};

export function App() {
	const queryClient = useQueryClient();
	const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
	const navigate = useNavigate();

	// Use task queries hook
	const {
		tasks,
		isLoading,
		error,
		createTask,
		updateTask,
		deleteTask,
		moveTask,
	} = useTaskQueries();

	// Local state
	const [filtersLoading, setFiltersLoading] = useState(true);
	const [filters, setFilters] = useState<FilterState>(defaultFilters);
	const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<Task>();
	const [notification, setNotification] = useState<NotificationState>({
		show: false,
	});
	const [statusesLoaded, setStatusesLoaded] = useState(false);
	const [updatingTaskId, setUpdatingTaskId] = useState<string>();
	const [initError, setInitError] = useState<Error | null>(null);

	// Load task statuses and initialize filters
	useEffect(() => {
		async function initialize() {
			if (!isAuthenticated || isAuthLoading) return;

			try {
				const [statuses] = await Promise.all([taskAPI.listStatuses()]);
				await initializeTaskStatuses(statuses);
				updateStatusMap();
				setStatusesLoaded(true);
				setFiltersLoading(false);
				setInitError(null);
			} catch (err) {
				console.error("Failed to initialize:", err);
				setInitError(
					err instanceof Error ? err : new Error("Failed to initialize"),
				);
				toast.error(
					"Failed to load task statuses. Please try refreshing the page.",
				);
			}
		}

		if (isAuthenticated && !isAuthLoading) {
			initialize();
		}
	}, [isAuthenticated, isAuthLoading]);

	// Disable task queries until statuses are loaded and auth is ready
	useEffect(() => {
		if (!statusesLoaded || !isAuthenticated || isAuthLoading) {
			queryClient.setQueryData(["tasks"], []);
		}
	}, [statusesLoaded, isAuthenticated, isAuthLoading, queryClient]);

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

	const handleTaskSubmit = (task: Partial<Task>) => {
		if (editingTask) {
			// Remove status and type fields as they're handled separately
			const { ...taskWithoutStatusAndType } = task;
			const taskUpdate: Partial<Task> = {
				...taskWithoutStatusAndType,
				status_id: task.status_id,
				priority_id: task.priority_id,
				type_id: task.type_id,
			};
			handleTaskUpdate(editingTask.id, taskUpdate);
		} else {
			handleCreateTask(task);
		}
	};

	const handleCreateTask = async (task: Partial<Task>) => {
		await createTask({
			...task,
			order: tasks.length,
			status_id: task.status_id ?? 1, // Default to first status
			priority_id: task.priority_id ?? 1, // Default to first priority
			type_id: task.type_id ?? 1, // Default to first type
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
				parent: task.relationships?.parent,
				dependencies: task.relationships?.dependencies || [],
				labels: task.relationships?.labels || [],
			},
		});
		setIsTaskFormOpen(false);
	};

	const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
		if (!taskId) return;
		setUpdatingTaskId(taskId);
		try {
			const existingTask = tasks.find((t) => t.id === taskId);
			if (!existingTask) {
				throw new Error("Task not found");
			}

			await updateTask({
				id: taskId,
				updates: {
					...updates,
					content: {
						...existingTask.content,
						...updates.content,
						description:
							updates.content?.description || existingTask.content.description,
						acceptance_criteria:
							updates.content?.acceptance_criteria ||
							existingTask.content.acceptance_criteria,
						implementation_details: updates.content?.implementation_details,
						notes: updates.content?.notes,
						attachments: updates.content?.attachments || [],
						due_date: updates.content?.due_date,
						assignee: updates.content?.assignee,
					},
				},
			});
			setIsTaskFormOpen(false);
		} finally {
			setUpdatingTaskId(undefined);
		}
	};

	const handleDeleteTask = async (taskId: string) => {
		await deleteTask(taskId);
	};

	const handleTaskMove = async (
		taskId: string,
		newStatusId: TaskStatusId,
		newIndex?: number,
	) => {
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

			// Create move request
			const moveRequest = {
				status_id: Number(newStatusId),
				order: newOrder,
				comment: `Task moved to ${targetStatus.name}`,
				type: taskToUpdate.type?.code,
			};

			await moveTask({ taskId, request: moveRequest });

			// Show notification
			setNotification({
				show: true,
				taskTitle: taskToUpdate.title,
				status: targetStatus,
			});
		} catch (err) {
			console.error("Move failed:", err);
		}
	};

	const handleTaskEdit = (taskId: string) => {
		const task = tasks.find((t) => t.id === taskId);
		if (task) {
			setEditingTask(task);
			setIsTaskFormOpen(true);
		}
	};

	// ============================================================================
	// Event Handlers
	// ============================================================================

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

	// Show loading state while auth is initializing
	if (isAuthLoading) {
		return (
			<div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
				<div className="flex flex-col items-center space-y-4">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
					<div className="text-gray-500">Initializing...</div>
				</div>
			</div>
		);
	}

	// Show login redirect if not authenticated
	if (!isAuthenticated) {
		return (
			<div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
				<div className="text-center">
					<p className="text-gray-500 mb-4">Please log in to continue</p>
					<button
						type="button"
						onClick={() => navigate({ to: "/login" })}
						className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						Go to Login
					</button>
				</div>
			</div>
		);
	}

	// Show initialization error
	if (initError) {
		return (
			<div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
				<div className="text-center" data-testid="error-state">
					<div className="text-red-500 mb-4">⚠️</div>
					<p className="text-gray-600 mb-4">{initError.message}</p>
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	// Show loading state while initializing
	if (!statusesLoaded || isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
				<div className="flex flex-col items-center space-y-4">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
					<div className="text-gray-500">Loading task statuses...</div>
				</div>
			</div>
		);
	}

	// Show task error
	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
				<div className="text-center" data-testid="error-state">
					<div className="text-red-500 mb-4">⚠️</div>
					<p className="text-gray-600 mb-4">
						{error instanceof Error ? error.message : "An error occurred"}
					</p>
					<button
						type="button"
						onClick={() =>
							queryClient.invalidateQueries({ queryKey: ["tasks"] })
						}
						className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	// ============================================================================
	// Render
	// ============================================================================

	return (
		<div className="min-h-screen bg-gray-100">
			<Header />
			<main className="py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<Toaster position="bottom-right" />
					<div
						className="bg-gray-50 p-4 md:p-6"
						data-testid="task-list"
						style={{
							visibility: isLoading || filtersLoading ? "hidden" : "visible",
						}}
					>
						<header className="mb-8">
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
									data-testid="create-task-button"
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
												key={status.code}
												status={status}
												tasks={tasksInColumn}
												onDrop={handleTaskMove}
												onEdit={handleTaskEdit}
												onDelete={handleDeleteTask}
												isLoading={isLoading}
												updatingTaskId={updatingTaskId}
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
							isLoading={!statusesLoaded}
						/>
						<StatusNotification
							show={notification.show}
							onClose={() =>
								setNotification((prev) => ({ ...prev, show: false }))
							}
							taskTitle={notification.taskTitle ?? ""}
							status={notification.status}
						/>
					</div>
				</div>
			</main>
		</div>
	);
}
