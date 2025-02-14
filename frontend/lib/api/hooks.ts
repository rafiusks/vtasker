import {
	useQuery as useBaseQuery,
	useMutation as useBaseMutation,
	type UseQueryOptions,
	type UseMutationOptions,
} from "@tanstack/react-query";
import { apiRequest } from "./client";
import type { ApiResponse, ApiError } from "./client";

export function useQuery<TData = unknown>(
	path: string,
	options?: Omit<
		UseQueryOptions<ApiResponse<TData>, ApiError, TData>,
		"queryKey" | "queryFn"
	>,
) {
	return useBaseQuery<ApiResponse<TData>, ApiError, TData>({
		queryKey: [path],
		queryFn: () => apiRequest<TData>(path),
		...options,
	});
}

export function useMutation<TData = unknown, TVariables = unknown>(
	path: string,
	options?: Omit<
		UseMutationOptions<ApiResponse<TData>, ApiError, TVariables>,
		"mutationFn"
	>,
) {
	return useBaseMutation<ApiResponse<TData>, ApiError, TVariables>({
		mutationFn: (variables) =>
			apiRequest<TData>(path, {
				method: "POST",
				body: JSON.stringify(variables),
			}),
		...options,
	});
}

// Example usage:
// const { data, isLoading } = useQuery<Project[]>("/projects");
// const { mutate } = useMutation<Project, CreateProjectInput>("/projects");
