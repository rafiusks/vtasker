import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskAPI } from "../api/client";
import type { Task, RawTask } from "../types";
import type { TaskMoveRequest, TaskUpdateRequest } from "../api/client";
import { createTaskUpdateRequest } from "../utils/typeConverters";
import { toast } from "react-hot-toast";

export const useTaskQueries = () => {
	const queryClient = useQueryClient();

	// Query for fetching all tasks
	const {
		data: tasks = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["tasks"],
		queryFn: () => taskAPI.listTasks(),
	});

	// Mutation for creating a task
	const createTaskMutation = useMutation({
		mutationFn: (task: Partial<RawTask>) => taskAPI.createTask(task),
		onSuccess: (newTask) => {
			queryClient.setQueryData(["tasks"], (oldTasks: Task[] = []) => [
				...oldTasks,
				newTask,
			]);
			toast.success("Task created successfully");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to create task",
			);
		},
	});

	// Mutation for updating a task
	const updateTaskMutation = useMutation({
		mutationFn: async ({
			id,
			updates,
		}: { id: string; updates: Partial<Task> }) => {
			const existingTask = tasks.find((task) => task.id === id);
			if (!existingTask) {
				throw new Error("Task not found");
			}
			const updateRequest = createTaskUpdateRequest(updates, existingTask);
			return taskAPI.updateTask(id, updateRequest);
		},
		onMutate: async ({ id, updates }) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: ["tasks"] });

			// Snapshot the previous value
			const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);

			// Optimistically update to the new value
			if (previousTasks) {
				queryClient.setQueryData<Task[]>(["tasks"], (old) => {
					const oldTasks = old || [];
					return oldTasks.map((task) =>
						task.id === id ? { ...task, ...updates } : task,
					);
				});
			}

			// Return a context object with the snapshotted value
			return { previousTasks };
		},
		onError: (err, variables, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousTasks) {
				queryClient.setQueryData(["tasks"], context.previousTasks);
			}
			toast.error(err instanceof Error ? err.message : "Failed to update task");
		},
		onSuccess: (updatedTask) => {
			queryClient.setQueryData(["tasks"], (oldTasks: Task[] = []) =>
				oldTasks.map((task) =>
					task.id === updatedTask.id ? updatedTask : task,
				),
			);
			toast.success("Task updated successfully");
		},
		onSettled: () => {
			// Always refetch after error or success to ensure we're up to date
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});

	// Mutation for deleting a task
	const deleteTaskMutation = useMutation({
		mutationFn: (id: string) => taskAPI.deleteTask(id),
		onSuccess: (_, deletedId) => {
			queryClient.setQueryData(["tasks"], (oldTasks: Task[] = []) =>
				oldTasks.filter((task) => task.id !== deletedId),
			);
			toast.success("Task deleted successfully");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete task",
			);
		},
	});

	// Mutation for moving a task
	const moveTaskMutation = useMutation({
		mutationFn: ({
			taskId,
			request,
		}: { taskId: string; request: TaskMoveRequest }) =>
			taskAPI.moveTask(taskId, request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to move task",
			);
			// Invalidate to ensure UI is in sync with server
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});

	return {
		tasks,
		isLoading,
		error,
		createTask: createTaskMutation.mutate,
		updateTask: updateTaskMutation.mutate,
		deleteTask: deleteTaskMutation.mutate,
		moveTask: moveTaskMutation.mutate,
		isCreating: createTaskMutation.isPending,
		isUpdating: updateTaskMutation.isPending,
		isDeleting: deleteTaskMutation.isPending,
		isMoving: moveTaskMutation.isPending,
	};
};
