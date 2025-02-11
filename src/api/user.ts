import type { User } from "../types/auth";
import { authAPI } from "./client";

export const searchUsers = async (query: string): Promise<User[]> => {
	const response = await authAPI.searchUsers(query);
	return response as User[];
};
