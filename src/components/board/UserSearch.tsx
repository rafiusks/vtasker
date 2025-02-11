import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "../../api/user";
import type { User } from "../../types/auth";
import type { BoardRole } from "../../types/board";
import { Input } from "../common/Input";

interface UserSearchProps {
	onSelect: (user: User, role: BoardRole) => void;
	existingUserIds?: string[];
	onCancel: () => void;
}

export const UserSearch = ({
	onSelect,
	existingUserIds = [],
	onCancel,
}: UserSearchProps) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRole, setSelectedRole] = useState<BoardRole>("viewer");
	const [debouncedTerm, setDebouncedTerm] = useState("");

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedTerm(searchTerm);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchTerm]);

	const { data: users, isLoading } = useQuery({
		queryKey: ["users", "search", debouncedTerm],
		queryFn: () => searchUsers(debouncedTerm),
		enabled: debouncedTerm.length >= 2,
	});

	const filteredUsers = users?.filter(
		(user) => !existingUserIds.includes(user.id),
	);

	const handleUserSelect = (user: User) => {
		onSelect(user, selectedRole);
	};

	return (
		<div className="space-y-4">
			<div className="flex gap-4">
				<div className="flex-1">
					<Input
						label="Search Users"
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Enter email or name"
						aria-label="Search users by name or email"
					/>
				</div>
				<div>
					<label
						htmlFor="role"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Role
					</label>
					<select
						id="role"
						value={selectedRole}
						onChange={(e) => setSelectedRole(e.target.value as BoardRole)}
						className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
					>
						<option value="viewer">Viewer</option>
						<option value="editor">Editor</option>
						<option value="admin">Admin</option>
					</select>
				</div>
			</div>

			{isLoading ? (
				<div className="text-center py-4" aria-live="polite">
					<div
						className="animate-spin h-5 w-5 mx-auto border-2 border-blue-600 rounded-full border-t-transparent"
						role="status"
					>
						<span className="sr-only">Loading...</span>
					</div>
				</div>
			) : searchTerm.length < 2 ? (
				<p
					className="text-sm text-gray-500 text-center py-4"
					aria-live="polite"
				>
					Enter at least 2 characters to search
				</p>
			) : filteredUsers?.length === 0 ? (
				<p
					className="text-sm text-gray-500 text-center py-4"
					aria-live="polite"
				>
					No users found
				</p>
			) : (
				<div className="border rounded-md divide-y divide-gray-200 max-h-64 overflow-y-auto">
					{filteredUsers?.map((user) => (
						<button
							key={user.id}
							type="button"
							className="w-full text-left py-3 px-4 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
							onClick={() => handleUserSelect(user)}
						>
							<div className="flex items-center space-x-4">
								{user.avatar_url && (
									<img
										src={user.avatar_url}
										alt=""
										className="h-8 w-8 rounded-full"
										aria-hidden="true"
									/>
								)}
								<div>
									<p className="text-sm font-medium text-gray-900">
										{user.name}
									</p>
									<p className="text-sm text-gray-500">{user.email}</p>
								</div>
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	);
};
