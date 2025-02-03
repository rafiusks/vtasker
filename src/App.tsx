import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PlusIcon } from "@heroicons/react/20/solid";
import { TaskForm } from "./components/TaskForm";
import { TaskColumn } from "./components/TaskColumn";
import { Select, type Option } from "./components/Select";
import type { Task, TaskStatus, TaskPriority, TaskStatusCode } from "./types";
import { StatusNotification } from "./components/StatusNotification";
import { toast } from "react-hot-toast";
import { taskAPI } from "./api/client";
import type { TaskMoveRequest } from "./api/client";

type FilterValue = number[] | string[] | string;

interface FilterState {
	status: number[];
	priority: string[];
	labels: string[];
	sortBy: string;
	sortOrder: "asc" | "desc";
}

const defaultFilters: FilterState = {
	status: [],
	priority: [],
	labels: [],
	sortBy: "created_at",
	sortOrder: "desc",
};

const statusOptions: TaskStatus[] = [
	{
		id: 1,
		code: "backlog" as TaskStatusCode,
		name: "Backlog",
		display_order: 0,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	{
		id: 2,
		code: "in-progress" as TaskStatusCode,
		name: "In Progress",
		display_order: 1,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	{
		id: 3,
		code: "review" as TaskStatusCode,
		name: "Review",
		display_order: 2,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	{
		id: 4,
		code: "done" as TaskStatusCode,
		name: "Done",
		display_order: 3,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
];

const priorityOptions: { value: TaskPriority; label: string }[] = [
	{ value: "low", label: "Low" },
	{ value: "normal", label: "Normal" },
	{ value: "high", label: "High" },
];

const sortOptions: { value: FilterState["sortBy"]; label: string }[] = [
	{ value: "created_at", label: "Creation Date" },
	{ value: "priority", label: "Priority" },
];

const sortOrderOptions: { value: FilterState["sortOrder"]; label: string }[] = [
	{ value: "asc", label: "↑" },
	{ value: "desc", label: "↓" },
];

export function App() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [statuses, setStatuses] = useState<TaskStatus[]>([]);
	const [error, setError] = useState<string>();
	const [loading, setLoading] = useState(true);
	const [filtersLoading, setFiltersLoading] = useState(true);
	const [filters, setFilters] = useState<FilterState>({
		status: [],
		priority: [],
		labels: [],
		sortBy: "created_at",
		sortOrder: "desc",
	});
	const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<Task>();
	const [notification, setNotification] = useState<{
		show: boolean;
		taskTitle?: string;
		fromStatus?: string;
		toStatus?: string;
	}>({ show: false });

	// Fetch tasks and statuses on mount
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const [tasksData, statusesData] = await Promise.all([
					taskAPI.listTasks(),
					taskAPI.listStatuses().catch((err) => {
						console.error("Failed to fetch task statuses:", err);
						return statusOptions; // Fall back to hardcoded statuses
					}),
				]);
				setTasks(tasksData);
				setStatuses(statusesData);
			} catch (err) {
				console.error("Failed to fetch data:", err);
				setError(err instanceof Error ? err.message : "Failed to fetch data");
			} finally {
				setLoading(false);
			}
		};
		fetchData();
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
						urlFilters.status = validStatuses.map((s) =>
							Number.parseInt(s, 10),
						);
					}
				} else if (key === "priority") {
					const validPriorities = values.filter((v) =>
						["low", "normal", "high"].includes(v),
					) as TaskPriority[];
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
		if (sortBy === "created_at" || sortBy === "priority") {
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

	useEffect(() => {
		loadTasks();
	}, []);

	const loadTasks = async () => {
		try {
			setLoading(true);
			const response = await fetch("http://localhost:8000/api/tasks", {
				headers: {
					"Content-Type": "application/json",
				},
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setTasks(Array.isArray(data) ? data : []);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load tasks");
			console.error(err);
			setTasks([]);
		} finally {
			setLoading(false);
		}
	};

	const filteredTasks = tasks
		.filter((task) => {
			if (filters.status.length && !filters.status.includes(task.status_id))
				return false;
			if (
				filters.priority.length &&
				!filters.priority.includes(task.priority?.code)
			)
				return false;
			if (
				filters.labels.length &&
				!filters.labels.some((label) =>
					task.relationships.labels.includes(label),
				)
			)
				return false;
			return true;
		})
		.sort((a, b) => {
			const priorityOrder: Record<TaskPriority, number> = {
				high: 3,
				normal: 2,
				low: 1,
			};
			const getValue = (task: Task) => {
				if (filters.sortBy === "created_at") {
					return new Date(task.created_at ?? "").getTime();
				}
				const priorityCode = (task.priority?.code ?? "normal") as TaskPriority;
				return priorityOrder[priorityCode];
			};
			const aValue = getValue(a);
			const bValue = getValue(b);
			return filters.sortOrder === "desc" ? bValue - aValue : aValue - bValue;
		});

	const columns = {
		backlog: filteredTasks
			.filter((t) => t.status_id === 1)
			.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
		"in-progress": filteredTasks
			.filter((t) => t.status_id === 2)
			.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
		review: filteredTasks
			.filter((t) => t.status_id === 3)
			.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
		done: filteredTasks
			.filter((t) => t.status_id === 4)
			.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
	};

	const allLabels = Array.from(
		new Set(tasks.flatMap((t) => t.relationships.labels)),
	);

	const handleFilterChange = (type: keyof FilterState, value: FilterValue) => {
		setFilters((prev) => {
			const newFilters = { ...prev };
			if (Array.isArray(value)) {
				if (type === "status") {
					newFilters.status = value as number[];
				} else if (type === "priority") {
					newFilters.priority = value as string[];
				} else if (type === "labels") {
					newFilters.labels = value as string[];
				}
			} else if (type === "sortBy") {
				newFilters.sortBy = value;
			} else if (type === "sortOrder") {
				newFilters.sortOrder =
					value === "asc" || value === "desc" ? value : "desc";
			}
			return newFilters;
		});
	};

	const clearFilters = () => {
		setFilters(defaultFilters);
	};

	const activeFilterCount =
		filters.status.length + filters.priority.length + filters.labels.length;

	const handleTaskMove = async (
		taskId: string,
		newStatusId: number,
		newIndex?: number,
	) => {
		const originalTasks = [...tasks];

		try {
			const taskToUpdate = tasks.find((t) => t.id === taskId);
			if (!taskToUpdate) throw new Error("Task not found");

			// Calculate new order and get target status
			const targetStatus = statuses.find((s) => s.id === newStatusId);
			const tasksInTargetColumn = tasks.filter(
				(t) => t.status_id === newStatusId,
			);
			const newOrder =
				typeof newIndex === "number" ? newIndex : tasksInTargetColumn.length;

			// Create optimized task version for UI
			const optimisticTask = {
				...taskToUpdate,
				status_id: newStatusId,
				order: newOrder,
				status: targetStatus,
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
			const moveRequest = {
				status_id: newStatusId,
				order: newOrder,
				previous_status_id: taskToUpdate.status_id,
				comment: `Moved from ${taskToUpdate.status?.name} to ${targetStatus?.name}`,
				type: taskToUpdate.type,
				_moveOperation: true,
			};

			const updatedTask = await taskAPI.moveTask(taskId, moveRequest);

			// Only update if server returns valid response
			if (updatedTask?.id) {
				setTasks((prev) =>
					prev.map((t) => (t.id === taskId ? { ...t, ...updatedTask } : t)),
				);
			}
		} catch (err) {
			console.error("Move failed:", err);
			setTasks(originalTasks);
			toast.error("Failed to move task. Changes reverted.");
		}
	};

	const handleCreateTask = async (task: Partial<Task>) => {
		try {
			const newTask = await taskAPI.createTask({
				...task,
				order: tasks.length,
			});
			setTasks((prev) => [...prev, newTask]);
			setIsTaskFormOpen(false);
		} catch (err) {
			console.error("Failed to create task:", err);
			setError(err instanceof Error ? err.message : "Failed to create task");
		}
	};

	const handleEditTask = async (taskId: string, updates: Partial<Task>) => {
		if (!taskId) return;

		try {
			// Find the existing task
			const existingTask = tasks.find((t) => t.id === taskId);
			if (!existingTask) {
				throw new Error("Task not found");
			}

			// Clean up dependencies - ensure they are valid task IDs
			const cleanDependencies =
				updates.dependencies?.filter((dep) => {
					// Check if the dependency exists in the tasks list and is a valid string
					return typeof dep === "string" && tasks.some((t) => t.id === dep);
				}) ?? existingTask.dependencies;

			// Merge updates with existing task data
			const mergedUpdates = {
				...updates,
				dependencies: cleanDependencies,
				content: updates.content
					? {
							...existingTask.content,
							...updates.content,
						}
					: existingTask.content,
			};

			// Send update to server
			const updatedTask = await taskAPI.updateTask(taskId, mergedUpdates);

			// Update local state
			setTasks((prevTasks) =>
				prevTasks.map((t) => (t.id === taskId ? updatedTask : t)),
			);

			toast.success("Task updated successfully");
		} catch (err) {
			console.error("Failed to update task:", err);
			toast.error(err instanceof Error ? err.message : "Failed to update task");
		}
	};

	const closeTaskForm = () => {
		setIsTaskFormOpen(false);
		setEditingTask(undefined);
	};

	const handleDeleteTask = async (taskId: string) => {
		try {
			await taskAPI.deleteTask(taskId);
			// Remove task from state
			setTasks((prev) => prev.filter((task) => task.id !== taskId));
		} catch (err) {
			console.error("Failed to delete task:", err);
			setError(err instanceof Error ? err.message : "Failed to delete task");
		}
	};

	const handleTaskClick = (task: Task) => {
		setEditingTask(task);
		setIsTaskFormOpen(true);
	};

	if (loading || filtersLoading) {
		return (
			<div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
					<p className="text-gray-600">Loading tasks...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
				<div className="text-center">
					<div className="text-red-500 mb-4">⚠️</div>
					<p className="text-gray-600">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<DndProvider backend={HTML5Backend}>
			<div className="min-h-screen bg-gray-50 p-4 md:p-6">
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
							aria-label="New Task"
						>
							<PlusIcon className="h-5 w-5" aria-hidden="true" />
							New Task
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
									onChange={(value) => handleFilterChange("status", value)}
									options={statusOptions}
									multiple
								/>
								<Select
									label="Priority"
									value={filters.priority}
									onChange={(value) => handleFilterChange("priority", value)}
									options={priorityOptions}
									multiple
								/>
							</div>

							{/* Labels Filter */}
							<Select
								label="Labels"
								value={filters.labels}
								onChange={(value) => handleFilterChange("labels", value)}
								options={allLabels.map((label) => ({
									value: label,
									label,
								}))}
								multiple
							/>

							{/* Sort Controls */}
							<div className="flex items-start gap-2">
								<Select
									label="Sort By"
									value={filters.sortBy}
									onChange={(value) => handleFilterChange("sortBy", value)}
									options={sortOptions}
								/>
								<Select
									label="Sort Order"
									value={filters.sortOrder}
									onChange={(value) => handleFilterChange("sortOrder", value)}
									options={sortOrderOptions}
									isIconOnly
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
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						{statuses.map((status) => (
							<TaskColumn
								key={status.id}
								status={status}
								tasks={tasks.filter((t) => t.status_id === status.id)}
								onDrop={handleTaskMove}
								onEdit={handleEditTask}
								onDelete={handleDeleteTask}
								onTaskClick={handleTaskClick}
							/>
						))}
					</div>
				</main>

				{/* Task Form - used for create/edit/view */}
				<TaskForm
					isOpen={isTaskFormOpen}
					onClose={closeTaskForm}
					onSubmit={
						editingTask
							? (task) => handleEditTask(editingTask.id, task)
							: handleCreateTask
					}
					task={editingTask}
					allTasks={tasks}
				/>
				<StatusNotification
					show={notification.show}
					onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
					taskTitle={notification.taskTitle}
					fromStatus={notification.fromStatus}
					toStatus={notification.toStatus}
				/>
			</div>
		</DndProvider>
	);
}
