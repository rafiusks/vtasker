import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task } from "../types";
import { taskAPI } from "../api/client";

export function useTaskQueries() {
	const queryClient = useQueryClient();

	const {
		data: tasks = [],
		isLoading,
		error,
	} = useQuery<Task[]>({
		queryKey: ["tasks"],
		queryFn: () => taskAPI.listTasks(),
	});

	const { mutate: createTask, isPending: isCreating } = useMutation({
		mutationFn: (task: Partial<Task>) => taskAPI.createTask(task),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});

	const { mutate: updateTask, isPending: isUpdating } = useMutation({
		mutationFn: ({
			id,
			updates,
		}: {
			id: string;
			updates: Partial<Task>;
		}) => taskAPI.updateTask(id, updates),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});

	const { mutate: deleteTask, isPending: isDeleting } = useMutation({
		mutationFn: (id: string) => taskAPI.deleteTask(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});

	const { mutate: moveTask, isPending: isMoving } = useMutation({
		mutationFn: ({
			taskId,
			request,
		}: {
			taskId: string;
			request: {
				status_id: number;
				order: number;
				previous_status_id?: number;
				comment?: string;
				type: string;
			};
		}) => taskAPI.moveTask(taskId, request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});

	return {
		tasks,
		isLoading,
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
