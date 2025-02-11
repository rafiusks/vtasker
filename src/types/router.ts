export interface BoardPageParams {
	boardSlug: string;
}

export interface TaskPageParams extends BoardPageParams {
	taskId: string;
}

export interface BoardLoaderData {
	boardSlug: string;
}

export interface TaskLoaderData extends BoardLoaderData {
	taskId: string;
}
