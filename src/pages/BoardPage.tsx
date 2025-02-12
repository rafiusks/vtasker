import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardAPI, taskAPI } from "../api/client";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { TaskColumn } from "../components/task/TaskColumn";
import { TaskModal } from "../components/task/TaskModal";
import { BoardSettingsModal } from "../components/board/BoardSettingsModal";
import { Button } from "../components/common/Button";
import { toast } from "sonner";
import type {
	Task,
	TaskContent,
	TaskMetadata,
	TaskProgress,
	TaskRelationships,
} from "../types";
import type {
	TaskStatusUI,
	TaskStatusEntity,
	TaskPriorityEntity,
	TaskTypeEntity,
} from "../types/typeReference";

interface TaskStatusResponse {
	id: number;
	code: string;
	name: string;
	description?: string;
	color: string;
	display_order: number;
	created_at: string;
	updated_at: string;
}

interface TaskAPIResponse {
	id: number;
	code: string;
	name: string;
	description?: string;
	color: string;
	display_order: number;
	created_at: string;
	updated_at: string;
}

export const BoardPage = () => {
	const { boardSlug } = useParams({ from: "/b/$boardSlug" });
	const queryClient = useQueryClient();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const navigate = useNavigate();

	// Load board data
	const {
		data: board,
		isLoading: isLoadingBoard,
		error: boardError,
	} = useQuery({
		queryKey: ["board", boardSlug],
		queryFn: () => boardAPI.getBoard(boardSlug),
	});

	// Load task statuses
	const {
		data: taskStatuses,
		isLoading: isLoadingStatuses,
		error: statusesError,
	} = useQuery<TaskStatusEntity[]>({
		queryKey: ["taskStatuses"],
		queryFn: () => taskAPI.listStatuses(),
	});

	// Load task priorities
	const {
		data: taskPriorities,
		isLoading: isLoadingPriorities,
		error: prioritiesError,
	} = useQuery<TaskPriorityEntity[]>({
		queryKey: ["taskPriorities"],
		queryFn: () => taskAPI.listPriorities(),
	});

	// Load task types
	const {
		data: taskTypes,
		isLoading: isLoadingTypes,
		error: typesError,
	} = useQuery<TaskTypeEntity[]>({
		queryKey: ["taskTypes"],
		queryFn: () => taskAPI.listTaskTypes(),
	});

	// Create task mutation
	const createTaskMutation = useMutation({
		mutationFn: async (data: Partial<Task>) => {
			const now = new Date().toISOString();
			const metadata: TaskMetadata = {
				created_at: now,
				updated_at: now,
				board: board?.id,
			};
			const relationships: TaskRelationships = {
				parent: undefined,
				dependencies: [],
				labels: [],
			};
			const progress: TaskProgress = {
				acceptance_criteria: {
					total: 0,
					completed: 0,
				},
				percentage: 0,
			};
			const content: TaskContent = {
				description: data.description || "",
				acceptance_criteria: [],
				attachments: [],
			};

			return taskAPI.createTask({
				...data,
				metadata,
				relationships,
				progress,
				content,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["board", boardSlug] });
			setIsCreateModalOpen(false);
			toast.success("Task created successfully");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to create task",
			);
		},
	});

	// Update task mutation
	const updateTaskMutation = useMutation({
		mutationFn: async (data: { id: string; updates: Partial<Task> }) => {
			return taskAPI.updateTask(data.id, data.updates);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["board", boardSlug] });
			setEditingTask(null);
			toast.success("Task updated successfully");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to update task",
			);
		},
	});

	// Delete task mutation
	const deleteTaskMutation = useMutation({
		mutationFn: async (taskId: string) => {
			return taskAPI.deleteTask(taskId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["board", boardSlug] });
			toast.success("Task deleted successfully");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete task",
			);
		},
	});

	// Move task mutation
	const moveTaskMutation = useMutation({
		mutationFn: async ({
			taskId,
			statusId,
		}: {
			taskId: string;
			statusId: number;
		}) => {
			return taskAPI.moveTask(taskId, {
				status_id: statusId,
				order: 0,
				type: "move",
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["board", boardSlug] });
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to move task",
			);
		},
	});

	// Initialize status map
	const [statusMap, setStatusMap] = useState<Map<number, TaskStatusUI>>(
		new Map(),
	);

	useEffect(() => {
		if (taskStatuses) {
			console.log("Initializing task statuses with:", taskStatuses);
			const map = new Map<number, TaskStatusUI>();
			for (const status of taskStatuses) {
				map.set(status.id, {
					id: status.id,
					code: status.code,
					name: status.name,
					color: status.color,
					display_order: status.display_order,
				});
			}
			console.log("Task statuses initialized:", map);
			setStatusMap(map);
			console.log("Updating status map");
			console.log("Status map updated:", map);
		}
	}, [taskStatuses]);

	if (isLoadingBoard || isLoadingStatuses) {
		return (
			<div className="flex justify-center items-center h-64">
				<LoadingSpinner />
			</div>
		);
	}

	if (boardError || statusesError) {
		return (
			<div className="text-center py-12">
				<p className="text-red-500">
					{boardError instanceof Error
						? boardError.message
						: "Failed to load board"}
				</p>
			</div>
		);
	}

	if (!board || !taskStatuses) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500">No board data available</p>
			</div>
		);
	}

	const handleCreateTask = (data: Partial<Task>) => {
		createTaskMutation.mutate(data);
	};

	const handleUpdateTask = (data: Partial<Task>) => {
		if (editingTask) {
			updateTaskMutation.mutate({
				id: editingTask.id,
				updates: data,
			});
		}
	};

	const handleDeleteTask = (taskId: string) => {
		if (
			window.confirm(
				"Are you sure you want to delete this task? This cannot be undone.",
			)
		) {
			deleteTaskMutation.mutate(taskId);
		}
	};

	const handleMoveTask = (taskId: string, newStatusId: number) => {
		moveTaskMutation.mutate({ taskId, statusId: newStatusId });
	};

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">{board.name}</h1>
					{board.description && (
						<p className="mt-1 text-sm text-gray-500">{board.description}</p>
					)}
				</div>
				<div className="flex gap-2">
					<Button
						onClick={() => setIsSettingsModalOpen(true)}
						variant="secondary"
						data-testid="board-settings-button"
					>
						Board Settings
					</Button>
					<Button
						onClick={() => setIsCreateModalOpen(true)}
						data-testid="create-task-button"
					>
						Create Task
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
				{taskStatuses.map((status) => {
					const statusUI: TaskStatusUI = {
						id: status.id,
						code: status.code,
						name: status.name,
						color: status.color,
						display_order: status.display_order,
					};
					return (
						<TaskColumn
							key={status.id}
							status={statusUI}
							tasks={
								board.tasks?.filter((t) => t.status_id === status.id) || []
							}
							onDrop={handleMoveTask}
							onEdit={(taskId) =>
								setEditingTask(
									board.tasks?.find((t) => t.id === taskId) || null,
								)
							}
							onDelete={handleDeleteTask}
							updatingTaskId={
								moveTaskMutation.isPending
									? moveTaskMutation.variables?.taskId
									: undefined
							}
						/>
					);
				})}
			</div>

			<TaskModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onSubmit={handleCreateTask}
				isLoading={createTaskMutation.isPending}
				statusOptions={taskStatuses}
				priorityOptions={taskPriorities || []}
				typeOptions={taskTypes || []}
			/>

			{editingTask && (
				<TaskModal
					isOpen={true}
					onClose={() => setEditingTask(null)}
					onSubmit={handleUpdateTask}
					initialData={editingTask}
					isLoading={updateTaskMutation.isPending}
					statusOptions={taskStatuses}
					priorityOptions={taskPriorities || []}
					typeOptions={taskTypes || []}
				/>
			)}

			{board && (
				<BoardSettingsModal
					isOpen={isSettingsModalOpen}
					onClose={() => setIsSettingsModalOpen(false)}
					board={board}
				/>
			)}
		</div>
	);
};
