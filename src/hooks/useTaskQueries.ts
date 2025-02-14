import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task } from "../types";
import { taskAPI } from "../api/client";
import { useAuth } from "../contexts/auth/context";
import type { TaskMoveRequest } from "../api/client";

export function useTaskQueries() {
	const queryClient = useQueryClient();
	const { isAuthenticated, isLoading: isAuthLoading, tokenReady } = useAuth();

	const {
		data: tasks = [],
		isLoading,
		error,
	} = useQuery<Task[]>({
		queryKey: ["tasks"],
		queryFn: taskAPI.listTasks,
		enabled: isAuthenticated && !isAuthLoading && tokenReady,
	});

	const { mutate: createTask, isPending: isCreating } = useMutation({
		mutationFn: taskAPI.createTask,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
		onError: (error) => {
			throw error;
		},
	});

	const { mutate: updateTask, isPending: isUpdating } = useMutation({
		mutationFn: async ({
			id,
			updates,
		}: { id: string; updates: Partial<Task> }) =>
			taskAPI.updateTask(id, updates),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
		onError: (error) => {
			throw error;
		},
	});

	const { mutate: deleteTask, isPending: isDeleting } = useMutation({
		mutationFn: taskAPI.deleteTask,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
		onError: (error) => {
			throw error;
		},
	});

	const { mutate: moveTask, isPending: isMoving } = useMutation({
		mutationFn: async ({
			taskId,
			request,
		}: {
			taskId: string;
			request: TaskMoveRequest;
		}) => taskAPI.moveTask(taskId, request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
		onError: (error) => {
			throw error;
		},
	});

	return {
		tasks,
		isLoading: isLoading || isAuthLoading || (isAuthenticated && !tokenReady),
		error,
		createTask,
		updateTask,
		deleteTask,
		moveTask,
		isCreating,
		isUpdating,
		isDeleting,
		isMoving,
	};
}
