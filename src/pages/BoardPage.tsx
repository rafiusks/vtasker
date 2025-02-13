import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boardAPI, taskAPI } from "../api/client";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Button } from "../components/common/Button";
import { TaskColumn } from "../components/task/TaskColumn";
import { TaskModal } from "../components/task/TaskModal";
import { BoardSettingsModal } from "../components/board/BoardSettingsModal";
import type { Task } from "../types";
import type {
	TaskStatusEntity,
	TaskPriorityEntity,
	TaskTypeEntity,
	TaskStatusUI,
} from "../types/typeReference";
import { toast } from "sonner";

export const BoardPage = () => {
	const { boardSlug } = useParams({ from: "/b/$boardSlug" });
	const queryClient = useQueryClient();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);

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
	} = useQuery<TaskPriorityEntity[]>({
		queryKey: ["taskPriorities"],
		queryFn: () => taskAPI.listPriorities(),
	});

	// Load task types
	const {
		data: taskTypes,
	} = useQuery<TaskTypeEntity[]>({
		queryKey: ["taskTypes"],
		queryFn: () => taskAPI.listTaskTypes(),
	});

	// Task mutations
	const createTaskMutation = useMutation({
		mutationFn: (data: Partial<Task>) => taskAPI.createTask(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["board", boardSlug] });
			setIsCreateModalOpen(false);
			toast.success("Task created successfully");
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Failed to create task");
		},
	});

	const updateTaskMutation = useMutation({
		mutationFn: ({ taskId, data }: { taskId: string; data: Partial<Task> }) =>
			taskAPI.updateTask(taskId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["board", boardSlug] });
			setEditingTask(null);
			toast.success("Task updated successfully");
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Failed to update task");
		},
	});

	const deleteTaskMutation = useMutation({
		mutationFn: (taskId: string) => taskAPI.deleteTask(taskId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["board", boardSlug] });
			toast.success("Task deleted successfully");
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Failed to delete task");
		},
	});

	const moveTaskMutation = useMutation({
		mutationFn: ({
			taskId,
			newStatusId,
		}: {
			taskId: string;
			newStatusId: number;
		}) =>
			taskAPI.moveTask(taskId, {
				status_id: newStatusId,
				order: 0,
				type: "move",
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["board", boardSlug] });
			toast.success("Task moved successfully");
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Failed to move task");
		},
	});

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
		createTaskMutation.mutate({
			...data,
			board_id: board.id,
			metadata: {
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				board: board.id,
				...data.metadata,
			},
		});
	};

	const handleUpdateTask = (data: Partial<Task>) => {
		if (editingTask) {
			updateTaskMutation.mutate({ taskId: editingTask.id, data });
		}
	};

	const handleDeleteTask = (taskId: string) => {
		deleteTaskMutation.mutate(taskId);
	};

	const handleMoveTask = (taskId: string, newStatusId: number) => {
		moveTaskMutation.mutate({ taskId, newStatusId });
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
							updatingTaskId={moveTaskMutation.isPending ? board.id : undefined}
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
