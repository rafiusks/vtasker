import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "@tanstack/react-router";
import { boardAPI, taskAPI } from "../api/client";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { TaskColumn } from "../components/task/TaskColumn";
import {
	TASK_STATUS,
	initializeTaskStatuses,
	updateStatusMap,
	isTaskStatusId,
} from "../types/typeReference";
import { Button } from "../components/common/Button";
import { BoardSettingsModal } from "../components/board/BoardSettingsModal";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { AppLayout } from "../App";
import { TaskForm } from "../components/TaskForm";
import type { Task } from "../types/task";
import type { BoardPageParams } from "../types/router";
import { router } from "../router";
import { Breadcrumbs } from "../components/common/Breadcrumbs";

export const BoardPage = () => {
	const navigate = useNavigate();
	const boardSlug = window.location.pathname.split("/b/")[1]?.split("/")[0];
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
	const [statusesLoaded, setStatusesLoaded] = useState(false);
	const [editingTask, setEditingTask] = useState<Task>();
	const [updatingTaskId, setUpdatingTaskId] = useState<string>();

	// Task mutations
	const { mutate: updateTask } = useMutation({
		mutationFn: async ({
			taskId,
			updates,
		}: {
			taskId: string;
			updates: Partial<Task>;
		}) => {
			return taskAPI.updateTask(taskId, updates);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["boards", boardSlug] });
			setIsTaskFormOpen(false);
			setEditingTask(undefined);
			toast.success("Task updated successfully");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to update task",
			);
		},
	});

	const { mutate: deleteTask } = useMutation({
		mutationFn: async (taskId: string) => {
			return taskAPI.deleteTask(taskId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["boards", boardSlug] });
			toast.success("Task deleted successfully");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete task",
			);
		},
	});

	const { mutate: moveTask } = useMutation({
		mutationFn: async ({
			taskId,
			newStatusId,
			newIndex,
		}: {
			taskId: string;
			newStatusId: number;
			newIndex?: number;
		}) => {
			const task = board?.tasks?.find((t) => t.id === taskId);
			if (!task) throw new Error("Task not found");

			return taskAPI.moveTask(taskId, {
				status_id: newStatusId,
				order: typeof newIndex === "number" ? newIndex : 0,
				previous_status_id: task.status_id,
				comment: `Task moved to ${TASK_STATUS[newStatusId]?.name || "new status"}`,
				type: task.type?.code || "feature",
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["boards", boardSlug] });
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to move task",
			);
		},
	});

	// Load task statuses
	useEffect(() => {
		async function loadStatuses() {
			try {
				const [statuses, priorities, types] = await Promise.all([
					taskAPI.listStatuses(),
					taskAPI.listPriorities(),
					taskAPI.listTaskTypes(),
				]);

				// Initialize the status map first
				await initializeTaskStatuses(statuses);
				updateStatusMap();

				// Only set loaded after everything is initialized
				setStatusesLoaded(true);
			} catch (error) {
				console.error("Failed to load task statuses:", error);
				toast.error("Failed to load task statuses");
			}
		}

		loadStatuses();
	}, []); // Only run once on mount

	const {
		data: board,
		isLoading: isBoardLoading,
		error,
	} = useQuery({
		queryKey: ["boards", boardSlug],
		queryFn: () => boardAPI.getBoard(boardSlug),
		retry: 1, // Only retry once to avoid long timeouts
		enabled: statusesLoaded, // Only fetch board after statuses are loaded
	});

	// Task handlers
	const handleTaskEdit = (taskId: string) => {
		const task = board?.tasks?.find((t) => t.id === taskId);
		if (task) {
			setEditingTask(task);
			setIsTaskFormOpen(true);
		}
	};

	const handleTaskDelete = async (taskId: string) => {
		if (confirm("Are you sure you want to delete this task?")) {
			await deleteTask(taskId);
		}
	};

	const handleTaskMove = async (
		taskId: string,
		newStatusId: number,
		newIndex?: number,
	) => {
		if (!isTaskStatusId(newStatusId)) return;
		setUpdatingTaskId(taskId);
		try {
			await moveTask({ taskId, newStatusId, newIndex });
		} finally {
			setUpdatingTaskId(undefined);
		}
	};

	const handleTaskSubmit = async (task: Partial<Task>) => {
		if (editingTask) {
			setUpdatingTaskId(editingTask.id);
			try {
				await updateTask({
					taskId: editingTask.id,
					updates: task,
				});
			} finally {
				setUpdatingTaskId(undefined);
			}
		} else {
			// Handle task creation
			try {
				const now = new Date().toISOString();
				const newTask = await taskAPI.createTask({
					title: task.title,
					description: task.description,
					status_id: task.status_id,
					priority_id: task.priority_id,
					type_id: task.type_id,
					order: task.order || 0,
					metadata: {
						created_at: now,
						updated_at: now,
						board: board?.id,
					},
					relationships: task.relationships || {
						dependencies: [],
						labels: [],
					},
				});
				queryClient.invalidateQueries({ queryKey: ["boards", boardSlug] });
				setIsTaskFormOpen(false);
				toast.success("Task created successfully");
				return newTask;
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to create task",
				);
			}
		}
	};

	if (!boardSlug) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500">Board not found</p>
			</div>
		);
	}

	if (isBoardLoading || !statusesLoaded) {
		return (
			<div
				className="flex justify-center items-center h-64"
				data-testid="loading-spinner"
			>
				<LoadingSpinner />
			</div>
		);
	}

	if (error) {
		console.error("Failed to load board:", error);
		return (
			<div className="text-center py-12">
				<p className="text-red-500">
					{error instanceof Error ? error.message : "Failed to load board"}
				</p>
			</div>
		);
	}

	if (!board) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500">Board not found</p>
			</div>
		);
	}

	const canManageBoard = Boolean(
		user?.id &&
			board &&
			// User is the board owner
			(board.owner_id === user.id ||
				// User is a board admin
				board.members?.some(
					(member) => member.user_id === user.id && member.role === "admin",
				)),
	);

	return (
		<AppLayout>
			<div className="flex flex-col h-full">
				<div className="flex justify-between items-center mb-4">
					<Breadcrumbs
						items={[
							{ label: "Dashboard", to: "/dashboard" },
							{ label: "Boards", to: "/boards" },
							{ label: board.name },
						]}
					/>
					<div className="flex gap-2">
						<Button
							data-testid="create-task-button"
							onClick={() => setIsTaskFormOpen(true)}
							variant="primary"
							disabled={!statusesLoaded}
						>
							Create Task
						</Button>
						{user?.id === board.owner_id && (
							<Button
								onClick={() => setIsSettingsOpen(true)}
								variant="secondary"
							>
								Board Settings
							</Button>
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-grow">
					{Object.entries(TASK_STATUS).map(([id, status]) => (
						<TaskColumn
							key={id}
							status={status}
							tasks={
								board.tasks?.filter(
									(task) => task.status_id === Number.parseInt(id, 10),
								) || []
							}
							onDrop={handleTaskMove}
							onEdit={handleTaskEdit}
							onDelete={handleTaskDelete}
							isLoading={false}
							updatingTaskId={updatingTaskId}
						/>
					))}
				</div>

				{isTaskFormOpen && statusesLoaded && (
					<TaskForm
						isOpen={isTaskFormOpen}
						onClose={() => {
							setIsTaskFormOpen(false);
							setEditingTask(undefined);
						}}
						onSubmit={handleTaskSubmit}
						task={editingTask}
						isLoading={false}
					/>
				)}

				{isSettingsOpen && (
					<BoardSettingsModal
						isOpen={isSettingsOpen}
						board={board}
						onClose={() => setIsSettingsOpen(false)}
						onBoardDeleted={() => setIsDeleteConfirmOpen(true)}
					/>
				)}
			</div>
		</AppLayout>
	);
};
