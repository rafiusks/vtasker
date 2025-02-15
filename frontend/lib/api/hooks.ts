import {
	useQuery as useBaseQuery,
	useMutation as useBaseMutation,
	useInfiniteQuery as useBaseInfiniteQuery,
	type UseQueryOptions,
	type UseMutationOptions,
	type UseInfiniteQueryOptions,
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

interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

interface InfiniteQueryParams {
	pageSize?: number;
	[key: string]: number | string | undefined;
}

export function useInfiniteQuery<TData = unknown>(
	path: string,
	params: InfiniteQueryParams = {},
) {
	const { pageSize = 10, ...restParams } = params;

	return useBaseInfiniteQuery({
		queryKey: [path, params],
		queryFn: async ({ pageParam = 1 }) => {
			const response = await apiRequest<PaginatedResponse<TData>>(path, {
				params: {
					...restParams,
					page: pageParam.toString(),
					pageSize: pageSize.toString(),
				},
			});
			return response.data;
		},
		getNextPageParam: (lastPage) => {
			if (lastPage.page >= lastPage.totalPages) {
				return undefined;
			}
			return lastPage.page + 1;
		},
		initialPageParam: 1,
	});
}

// Example usage:
// const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery<Project[]>("/projects", { pageSize: 20 });
// const { data, isLoading } = useQuery<Project[]>("/projects");
// const { mutate } = useMutation<Project, CreateProjectInput>("/projects");
