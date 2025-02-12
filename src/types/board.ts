import type { User } from "./auth";
import type { Task } from "./task";

export type BoardRole = "viewer" | "editor" | "admin";

export interface BoardMember {
	board_id: string;
	user_id: string;
	role: BoardRole;
	created_at: string;
	user?: User;
}

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

export interface BoardMemberInput {
	user_id: string;
	role: BoardRole;
}

export interface CreateBoardInput {
	name: string;
	description?: string;
	is_public: boolean;
	slug?: string;
}

export interface UpdateBoardInput {
	name?: string;
	description?: string;
	is_public?: boolean;
	members?: BoardMemberInput[];
}

export interface BoardResponse {
	board: Board;
}
