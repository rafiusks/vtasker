import { useState } from "react";
import type {
	BoardMember,
	BoardMemberInput,
	BoardRole,
} from "../../types/board";
import type { User } from "../../types/auth";
import { Button } from "../common/Button";
import { UserSearch } from "./UserSearch";

interface MemberListProps {
	members: BoardMember[];
	onChange: (members: BoardMemberInput[]) => void;
	ownerId?: string;
}

export const MemberList = ({ members, onChange, ownerId }: MemberListProps) => {
	const [isAddingMember, setIsAddingMember] = useState(false);

	const handleRoleChange = (userId: string, role: BoardRole) => {
		const updatedMembers = members.map((member) =>
			member.user_id === userId
				? { user_id: member.user_id, role }
				: { user_id: member.user_id, role: member.role },
		);
		onChange(updatedMembers);
	};

	const handleRemoveMember = (userId: string) => {
		const updatedMembers = members
			.filter((member) => member.user_id !== userId)
			.map((member) => ({
				user_id: member.user_id,
				role: member.role,
			}));
		onChange(updatedMembers);
	};

	const handleAddMember = (user: User, role: BoardRole) => {
		const updatedMembers = [
			...members.map((member) => ({
				user_id: member.user_id,
				role: member.role,
			})),
			{ user_id: user.id, role },
		];
		onChange(updatedMembers);
		setIsAddingMember(false);
	};

	return (
		<div className="space-y-4">
			<div className="overflow-hidden border border-gray-200 rounded-lg">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Member
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Role
							</th>
							<th scope="col" className="relative px-6 py-3">
								<span className="sr-only">Actions</span>
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{members.map((member) => (
							<tr key={member.user_id}>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="flex items-center">
										{member.user?.avatar_url && (
											<img
												className="h-8 w-8 rounded-full"
												src={member.user.avatar_url}
												alt=""
											/>
										)}
										<div className="ml-4">
											<div className="text-sm font-medium text-gray-900">
												{member.user?.full_name}
											</div>
											<div className="text-sm text-gray-500">
												{member.user?.email}
											</div>
										</div>
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									{member.user_id === ownerId ? (
										<span className="text-sm text-gray-500">Owner</span>
									) : (
										<select
											value={member.role}
											onChange={(e) =>
												handleRoleChange(
													member.user_id,
													e.target.value as BoardRole,
												)
											}
											className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
										>
											<option value="viewer">Viewer</option>
											<option value="editor">Editor</option>
											<option value="admin">Admin</option>
										</select>
									)}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									{member.user_id !== ownerId && (
										<button
											type="button"
											onClick={() => handleRemoveMember(member.user_id)}
											className="text-red-600 hover:text-red-900"
										>
											Remove
										</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{isAddingMember ? (
				<UserSearch
					onSelect={handleAddMember}
					existingUserIds={[
						...(ownerId ? [ownerId] : []),
						...members.map((m) => m.user_id),
					]}
					onCancel={() => setIsAddingMember(false)}
				/>
			) : (
				<Button
					type="button"
					variant="outline"
					onClick={() => setIsAddingMember(true)}
				>
					Add Member
				</Button>
			)}
		</div>
	);
};
