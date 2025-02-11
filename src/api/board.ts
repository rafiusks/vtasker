import type { Board, CreateBoardInput, UpdateBoardInput } from "../types/board";
import { BaseAPI } from "./api";

class BoardAPI extends BaseAPI {
	async getBoards(): Promise<Board[]> {
		return this.request<Board[]>("/boards");
	}

	async getBoard(identifier: string): Promise<Board> {
		return this.request<Board>(`/boards/${identifier}`);
	}

	async createBoard(input: CreateBoardInput): Promise<Board> {
		return this.request<Board>("/boards", {
			method: "POST",
			body: JSON.stringify(input),
		});
	}

	async updateBoard(id: string, input: UpdateBoardInput): Promise<Board> {
		return this.request<Board>(`/boards/${id}`, {
			method: "PATCH",
			body: JSON.stringify(input),
		});
	}

	async deleteBoard(id: string): Promise<void> {
		return this.request<void>(`/boards/${id}`, {
			method: "DELETE",
		});
	}
}

export const boardAPI = new BoardAPI();
export const { getBoards, getBoard, createBoard, updateBoard, deleteBoard } =
	boardAPI;
