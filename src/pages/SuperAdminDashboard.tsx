import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI, boardAPI } from "../api/client";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import type { User } from "../types/auth";
import type { Board } from "../types/board";

export const SuperAdminDashboard = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
	const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);
	const [activeTab, setActiveTab] = useState<
		"users" | "boards" | "settings" | "logs"
	>("users");
	const [userToDelete, setUserToDelete] = useState<User | null>(null);

	useEffect(() => {
		if (!user) {
			navigate({ to: "/login" });
			return;
		}

		if (user.role_code !== "super_admin") {
			navigate({ to: "/dashboard" });
			return;
		}
	}, [user, navigate]);

	// Fetch all users
	const {
		data: users,
		isLoading: isLoadingUsers,
		error: usersError,
	} = useQuery({
		queryKey: ["users"],
		queryFn: () => userAPI.listUsers(),
		enabled: user?.role_code === "super_admin",
	});

	// Fetch all boards
	const {
		data: boards,
		isLoading: isLoadingBoards,
		error: boardsError,
	} = useQuery({
		queryKey: ["boards", "all"],
		queryFn: () => boardAPI.listAllBoards(),
		enabled: user?.role_code === "super_admin",
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

	const deleteBoardMutation = useMutation({
		mutationFn: async (boardId: string) => {
			return boardAPI.deleteBoard(boardId);
		},
		onSuccess: () => {
			toast.success("Board deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["boards", "all"] });
			setBoardToDelete(null);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete board",
			);
		},
	});

	const deleteUserMutation = useMutation({
		mutationFn: async (userId: string) => {
			return userAPI.deleteUser(userId);
		},
		onSuccess: () => {
			toast.success("User deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete user",
			);
		},
	});

	const renderTabContent = () => {
		switch (activeTab) {
			case "users":
				return (
					<div data-testid="users-tab-content">
						<h2 className="text-xl font-semibold mb-4">User Management</h2>
						{isLoadingUsers ? (
							<div className="flex justify-center">
								<LoadingSpinner />
							</div>
						) : usersError ? (
							<div className="text-red-500">
								{usersError instanceof Error
									? usersError.message
									: "Failed to load users"}
							</div>
						) : (
							<div className="space-y-4">
								{users?.map((user) => (
									<div
										key={user.id}
										className="bg-white p-4 rounded-lg shadow"
										data-testid="user-item"
									>
										<div className="flex items-center justify-between">
											<div>
												<h3 className="font-medium">{user.full_name}</h3>
												<p className="text-sm text-gray-500">{user.email}</p>
												<p className="text-sm text-gray-500">
													Role: {user.role_code}
												</p>
											</div>
											<div className="space-x-2">
												<Button
													variant="secondary"
													onClick={() => setSelectedUser(user)}
													type="button"
													data-testid="edit-user-button"
												>
													Edit Role
												</Button>
												<div className="relative inline-block">
													<Button
														variant="danger"
														onClick={() => setUserToDelete(user)}
														type="button"
														data-testid="delete-user-button"
														disabled={user.role_code === "super_admin"}
														title={
															user.role_code === "super_admin"
																? "Super admin users cannot be deleted"
																: undefined
														}
													>
														Delete
													</Button>
													{user.role_code === "super_admin" && (
														<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-sm text-white bg-gray-800 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
															Super admin users cannot be deleted
														</div>
													)}
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				);
			case "boards":
				return (
					<div data-testid="boards-tab-content">
						<h2 className="text-xl font-semibold mb-4">Board Management</h2>
						{isLoadingBoards ? (
							<div className="flex justify-center">
								<LoadingSpinner />
							</div>
						) : boardsError ? (
							<div className="text-red-500">
								{boardsError instanceof Error
									? boardsError.message
									: "Failed to load boards"}
							</div>
						) : (
							<div className="space-y-4">
								{boards?.map((board) => (
									<div
										key={board.id}
										className="bg-white p-4 rounded-lg shadow"
										data-testid="board-item"
									>
										<div className="flex items-center justify-between">
											<div>
												<h3 className="font-medium">{board.name}</h3>
												<p className="text-sm text-gray-500">
													{board.description}
												</p>
												<p className="text-sm text-gray-500">
													Visibility: {board.is_public ? "Public" : "Private"}
												</p>
											</div>
											<div className="space-x-2">
												<Button
													variant="secondary"
													onClick={() => setSelectedBoard(board)}
													type="button"
													data-testid="edit-board-button"
												>
													Edit
												</Button>
												<Button
													variant="danger"
													onClick={() => setBoardToDelete(board)}
													type="button"
													data-testid="delete-board-button"
												>
													Delete
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				);
			case "settings":
				return (
					<div data-testid="settings-tab-content">
						<h2 className="text-xl font-semibold mb-4">System Settings</h2>
						<p className="text-gray-500">Coming soon...</p>
					</div>
				);
			case "logs":
				return (
					<div data-testid="logs-tab-content">
						<h2 className="text-xl font-semibold mb-4">System Logs</h2>
						<p className="text-gray-500">Coming soon...</p>
					</div>
				);
			default:
				return null;
		}
	};

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
		<div
			className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
			data-testid="super-admin-dashboard"
		>
			<div className="bg-white shadow rounded-lg">
				<div className="px-4 py-5 sm:p-6">
					<div className="mb-6">
						<h1 className="text-2xl font-bold text-gray-900">
							Super Admin Dashboard
						</h1>
						<p className="mt-1 text-sm text-gray-500">
							Manage users, boards, and system settings
						</p>
					</div>

					{/* Navigation Menu */}
					<div className="border-b border-gray-200 mb-6">
						<nav className="-mb-px flex space-x-4">
							<button
								type="button"
								onClick={() => setActiveTab("users")}
								className={`${
									activeTab === "users"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								} whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
								data-testid="users-tab"
							>
								Users
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("boards")}
								className={`${
									activeTab === "boards"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								} whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
								data-testid="boards-tab"
							>
								Boards
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("settings")}
								className={`${
									activeTab === "settings"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								} whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
								data-testid="settings-tab"
							>
								Settings
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("logs")}
								className={`${
									activeTab === "logs"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								} whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
								data-testid="logs-tab"
							>
								System Logs
							</button>
						</nav>
					</div>

					{/* Tab Content */}
					{renderTabContent()}
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
								<label
									htmlFor="role"
									className="block text-sm font-medium text-gray-700"
								>
									Role
								</label>
								<select
									id="role"
									className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
									value={selectedUser.role_code}
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
											role: selectedUser.role_code,
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
									className="text-sm"
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

			{/* Board Delete Confirmation Modal */}
			{boardToDelete && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
					data-testid="delete-board-modal"
				>
					<div className="bg-white p-6 rounded-lg shadow-lg w-96">
						<h2 className="text-xl font-bold mb-4">Delete Board</h2>
						<p className="mb-4">
							Are you sure you want to delete the board "{boardToDelete.name}"?
							This action cannot be undone.
						</p>
						<div className="flex justify-end gap-2">
							<Button
								variant="secondary"
								onClick={() => setBoardToDelete(null)}
								type="button"
								data-testid="cancel-delete-board"
							>
								Cancel
							</Button>
							<Button
								variant="danger"
								onClick={() => deleteBoardMutation.mutate(boardToDelete.id)}
								type="button"
								data-testid="confirm-delete-board"
							>
								Delete
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* User Delete Confirmation Modal */}
			{userToDelete && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
					data-testid="delete-user-modal"
				>
					<div className="bg-white p-6 rounded-lg shadow-lg w-96">
						<h2 className="text-xl font-bold mb-4">Delete User</h2>
						<p className="mb-4">
							Are you sure you want to delete the user "{userToDelete.full_name}
							"? This action cannot be undone.
						</p>
						<div className="flex justify-end gap-2">
							<Button
								variant="secondary"
								onClick={() => setUserToDelete(null)}
								type="button"
								data-testid="cancel-delete-user"
							>
								Cancel
							</Button>
							<Button
								variant="danger"
								onClick={() => {
									deleteUserMutation.mutate(userToDelete.id);
									setUserToDelete(null);
								}}
								type="button"
								data-testid="confirm-delete-user"
							>
								Delete
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
