import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI, boardAPI } from "../api/client";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import type { User } from "../types/user";
import type { Board } from "../types/board";

export const SuperAdminDashboard = () => {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);

	// Check if user is super admin
	if (!user?.role || user.role !== "super_admin") {
		return (
			<div className="text-center py-12">
				<p className="text-red-500">
					You don't have permission to access this page
				</p>
			</div>
		);
	}

	// Fetch all users
	const {
		data: users,
		isLoading: isLoadingUsers,
		error: usersError,
	} = useQuery({
		queryKey: ["users"],
		queryFn: () => userAPI.listUsers(),
		enabled: user?.role === "super_admin",
	});

	// Fetch all boards
	const {
		data: boards,
		isLoading: isLoadingBoards,
		error: boardsError,
	} = useQuery({
		queryKey: ["boards", "all"],
		queryFn: () => boardAPI.listAllBoards(),
		enabled: user?.role === "super_admin",
	});

	const updateUserMutation = useMutation({
		mutationFn: async (updates: {
			id: string;
			role: string;
			is_active?: boolean;
		}) => {
			return userAPI.updateUser(updates.id, {
				role: updates.role as "user" | "admin" | "super_admin",
				is_active: updates.is_active,
			});
		},
		onSuccess: () => {
			toast.success("User updated successfully");
			queryClient.invalidateQueries({ queryKey: ["users"] });
			setSelectedUser(null);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to update user",
			);
		},
	});

	const updateBoardMutation = useMutation({
		mutationFn: async (updates: {
			id: string;
			is_public: boolean;
			is_active?: boolean;
		}) => {
			return boardAPI.updateBoard(updates.id, {
				is_public: updates.is_public,
				is_active: updates.is_active,
			});
		},
		onSuccess: () => {
			toast.success("Board updated successfully");
			queryClient.invalidateQueries({ queryKey: ["boards", "all"] });
			setSelectedBoard(null);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to update board",
			);
		},
	});

	if (isLoadingUsers || isLoadingBoards) {
		return (
			<div className="flex justify-center items-center h-64">
				<LoadingSpinner />
			</div>
		);
	}

	if (usersError || boardsError) {
		return (
			<div className="text-center py-12">
				<p className="text-red-500">
					{usersError instanceof Error
						? usersError.message
						: "Failed to load data"}
				</p>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<h1 className="text-2xl font-bold text-gray-900 mb-8">
				Super Admin Dashboard
			</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{/* Users Management */}
				<div className="bg-white shadow rounded-lg p-6">
					<h2 className="text-xl font-semibold mb-4">Users Management</h2>
					<div className="space-y-4">
						{users?.map((u) => (
							<div
								key={u.id}
								className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
							>
								<div>
									<p className="font-medium">{u.full_name}</p>
									<p className="text-sm text-gray-500">{u.email}</p>
									<p className="text-xs text-gray-400">Role: {u.role}</p>
								</div>
								<div className="space-x-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setSelectedUser(u)}
									>
										Edit
									</Button>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Boards Management */}
				<div className="bg-white shadow rounded-lg p-6">
					<h2 className="text-xl font-semibold mb-4">Boards Management</h2>
					<div className="space-y-4">
						{boards?.map((b) => (
							<div
								key={b.id}
								className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
							>
								<div>
									<p className="font-medium">{b.name}</p>
									<p className="text-sm text-gray-500">Slug: {b.slug}</p>
									<p className="text-xs text-gray-400">
										Public: {b.is_public ? "Yes" : "No"}
									</p>
								</div>
								<div className="space-x-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setSelectedBoard(b)}
									>
										Edit
									</Button>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* User Edit Modal */}
			{selectedUser && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
						<h3 className="text-lg font-medium text-gray-900 mb-4">
							Edit User: {selectedUser.full_name}
						</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Role
								</label>
								<select
									className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
									value={selectedUser.role}
									onChange={(e) =>
										updateUserMutation.mutate({
											id: selectedUser.id,
											role: e.target.value,
										})
									}
								>
									<option value="user">User</option>
									<option value="admin">Admin</option>
									<option value="super_admin">Super Admin</option>
								</select>
							</div>
							<div className="flex justify-end space-x-3">
								<Button variant="outline" onClick={() => setSelectedUser(null)}>
									Cancel
								</Button>
								<Button
									onClick={() =>
										updateUserMutation.mutate({
											id: selectedUser.id,
											role: selectedUser.role,
										})
									}
									isLoading={updateUserMutation.isPending}
								>
									Save Changes
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Board Edit Modal */}
			{selectedBoard && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
						<h3 className="text-lg font-medium text-gray-900 mb-4">
							Edit Board: {selectedBoard.name}
						</h3>
						<div className="space-y-4">
							<div className="flex items-center">
								<input
									type="checkbox"
									id="is_public"
									checked={selectedBoard.is_public}
									onChange={(e) =>
										updateBoardMutation.mutate({
											id: selectedBoard.id,
											is_public: e.target.checked,
										})
									}
									className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
								/>
								<label
									htmlFor="is_public"
									className="ml-2 block text-sm text-gray-900"
								>
									Make board public
								</label>
							</div>
							<div className="flex justify-end space-x-3">
								<Button
									variant="outline"
									onClick={() => setSelectedBoard(null)}
								>
									Cancel
								</Button>
								<Button
									onClick={() =>
										updateBoardMutation.mutate({
											id: selectedBoard.id,
											is_public: selectedBoard.is_public,
										})
									}
									isLoading={updateBoardMutation.isPending}
								>
									Save Changes
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
