import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Board } from "../types/board";
import { boardAPI } from "../api/client";
import { useAuth } from "../contexts/auth/context";

export function useBoardQueries() {
	const queryClient = useQueryClient();
	const { isAuthenticated, isLoading: isAuthLoading, tokenReady } = useAuth();

	const {
		data: boards = [],
		isLoading,
		error,
	} = useQuery<Board[]>({
		queryKey: ["boards"],
		queryFn: () => boardAPI.listBoards(),
		enabled: isAuthenticated && !isAuthLoading && tokenReady,
	});

	const { mutate: createBoard, isPending: isCreating } = useMutation({
		mutationFn: boardAPI.createBoard,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["boards"] });
		},
	});

	const { mutate: updateBoard, isPending: isUpdating } = useMutation({
		mutationFn: async ({
			id,
			updates,
		}: {
			id: string;
			updates: { is_public: boolean; is_active?: boolean };
		}) =>
			boardAPI.updateBoard(id, updates),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["boards"] });
		},
	});

	const { mutate: deleteBoard, isPending: isDeleting } = useMutation({
		mutationFn: boardAPI.deleteBoard,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["boards"] });
		},
	});

	return {
		boards,
		isLoading: isLoading || isAuthLoading || (isAuthenticated && !tokenReady),
		error,
		createBoard,
		updateBoard,
		deleteBoard,
		isCreating,
		isUpdating,
		isDeleting,
	};
}
