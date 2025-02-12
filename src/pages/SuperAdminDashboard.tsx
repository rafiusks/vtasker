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

	const renderTabContent = () => {
		switch (activeTab) {
			case "users":
				return (
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
										<p className="text-xs text-gray-400">Role: {u.role_code}</p>
									</div>
									<div className="space-x-2">
										<Button
											variant="outline"
											className="text-sm"
											onClick={() => setSelectedUser(u)}
										>
											Edit
										</Button>
									</div>
								</div>
							))}
						</div>
					</div>
				);
			case "boards":
				return (
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
											className="text-sm"
											onClick={() => setSelectedBoard(b)}
										>
											Edit
										</Button>
										<Button
											variant="danger"
											className="text-sm"
											onClick={() => setBoardToDelete(b)}
										>
											Delete
										</Button>
									</div>
								</div>
							))}
						</div>
					</div>
				);
			case "settings":
				return (
					<div className="bg-white shadow rounded-lg p-6">
						<h2 className="text-xl font-semibold mb-4">System Settings</h2>
						<p className="text-gray-500">Coming soon...</p>
					</div>
				);
			case "logs":
				return (
					<div className="bg-white shadow rounded-lg p-6">
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
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-2xl font-bold text-gray-900">
					Super Admin Dashboard
				</h1>
				<div className="text-sm text-gray-500">
					Logged in as {user?.full_name}
				</div>
			</div>

			{/* Navigation Menu */}
			<nav className="mb-8">
				<div className="border-b border-gray-200">
					<div className="flex -mb-px space-x-8">
						<button
							type="button"
							onClick={() => setActiveTab("users")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "users"
									? "border-blue-500 text-blue-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							Users
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("boards")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "boards"
									? "border-blue-500 text-blue-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							Boards
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("settings")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "settings"
									? "border-blue-500 text-blue-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							Settings
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("logs")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "logs"
									? "border-blue-500 text-blue-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							System Logs
						</button>
					</div>
				</div>
			</nav>

			{/* Tab Content */}
			{renderTabContent()}

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
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
						<h3 className="text-lg font-medium text-gray-900 mb-4">
							Delete Board
						</h3>
						<p className="text-gray-600 mb-4">
							Are you sure you want to delete the board "{boardToDelete.name}"?
							This action cannot be undone.
						</p>
						<div className="flex justify-end space-x-3">
							<Button
								variant="outline"
								className="text-sm"
								onClick={() => setBoardToDelete(null)}
							>
								Cancel
							</Button>
							<Button
								variant="danger"
								onClick={() => deleteBoardMutation.mutate(boardToDelete.id)}
								isLoading={deleteBoardMutation.isPending}
							>
								Delete Board
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
