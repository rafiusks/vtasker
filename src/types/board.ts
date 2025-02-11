import type { User } from "./auth";
import type { Task } from "./task";

export type BoardRole = "viewer" | "editor" | "admin";

export interface Board {
	id: string;
	name: string;
	slug: string;
	description?: string;
	owner_id?: string;
	is_public: boolean;
	created_at: string;
	updated_at: string;
	members?: BoardMember[];
	tasks?: Task[];
}

export interface BoardMember {
	user_id: string;
	role: string;
}

export interface CreateBoardInput {
	name: string;
	slug?: string;
	description?: string;
	is_public?: boolean;
}

export interface UpdateBoardInput {
	name?: string;
	description?: string;
	is_public?: boolean;
}

export interface BoardResponse {
	board: Board;
}
