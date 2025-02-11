import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBoard, deleteBoard } from "../../api/board";
import type {
	Board,
	BoardMemberInput,
	UpdateBoardInput,
} from "../../types/board";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { MemberList } from "./MemberList";

interface BoardSettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	board: Board;
	onBoardDeleted?: () => void;
}

export const BoardSettingsModal = ({
	isOpen,
	onClose,
	board,
	onBoardDeleted,
}: BoardSettingsModalProps) => {
	const queryClient = useQueryClient();
	const [formData, setFormData] = useState<UpdateBoardInput>({
		name: board.name,
		description: board.description,
		is_public: board.is_public,
		members: board.members?.map((member) => ({
			user_id: member.user_id,
			role: member.role,
		})),
	});
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

	const { mutate: update, isPending: isUpdating } = useMutation({
		mutationFn: () => updateBoard(board.id, formData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["boards", board.id] });
			onClose();
		},
	});

	const { mutate: deleteBoardMutation, isPending: isDeleting } = useMutation({
		mutationFn: () => deleteBoard(board.id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["boards"] });
			onBoardDeleted?.();
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		update();
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value, type } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]:
				type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
		}));
	};

	const handleMembersChange = (members: BoardMemberInput[]) => {
		setFormData((prev) => ({ ...prev, members }));
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">
					Board Settings
				</h2>

				<form onSubmit={handleSubmit} className="space-y-6">
					<Input
						label="Board Name"
						name="name"
						value={formData.name || ""}
						onChange={handleChange}
						required
					/>

					<div className="space-y-1">
						<label
							htmlFor="description"
							className="block text-sm font-medium text-gray-700"
						>
							Description
						</label>
						<textarea
							id="description"
							name="description"
							value={formData.description || ""}
							onChange={handleChange}
							rows={3}
							className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
						/>
					</div>

					<div className="flex items-center">
						<input
							type="checkbox"
							id="is_public"
							name="is_public"
							checked={formData.is_public || false}
							onChange={handleChange}
							className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<label
							htmlFor="is_public"
							className="ml-2 block text-sm text-gray-900"
						>
							Make board public
						</label>
					</div>

					<div className="border-t pt-6">
						<h3 className="text-lg font-medium text-gray-900 mb-4">
							Board Members
						</h3>
						<MemberList
							members={board.members || []}
							onChange={handleMembersChange}
							ownerId={board.owner_id}
						/>
					</div>

					<div className="flex justify-between pt-6 border-t">
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsDeleteConfirmOpen(true)}
							className="!bg-red-50 !text-red-600 !border-red-200 hover:!bg-red-100"
						>
							Delete Board
						</Button>

						<div className="flex space-x-3">
							<Button type="button" variant="outline" onClick={onClose}>
								Cancel
							</Button>
							<Button type="submit" isLoading={isUpdating}>
								Save Changes
							</Button>
						</div>
					</div>
				</form>

				{/* Delete Confirmation Dialog */}
				{isDeleteConfirmOpen && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
						<div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								Delete Board
							</h3>
							<p className="text-gray-500 mb-4">
								Are you sure you want to delete this board? This action cannot
								be undone.
							</p>
							<div className="flex justify-end space-x-3">
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsDeleteConfirmOpen(false)}
								>
									Cancel
								</Button>
								<Button
									type="button"
									isLoading={isDeleting}
									className="!bg-red-600 hover:!bg-red-700"
									onClick={() => deleteBoardMutation()}
								>
									Delete
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
