import type { Board, CreateBoardInput, UpdateBoardInput } from "../types/board";
import { boardAPI } from "./client";

// Re-export the boardAPI instance
export { boardAPI };

// Export convenience methods that use the boardAPI instance
export const getBoards = () => boardAPI.listBoards();
export const getBoard = (identifier: string) => boardAPI.getBoard(identifier);
export const createBoard = (input: CreateBoardInput) =>
	boardAPI.createBoard(input);
export const updateBoard = (id: string, input: UpdateBoardInput) =>
	boardAPI.updateBoard(id, input);
export const deleteBoard = (id: string) => boardAPI.deleteBoard(id);
