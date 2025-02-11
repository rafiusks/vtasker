import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { getBoard, deleteBoard } from "../api/board";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { TaskColumn } from "../components/task/TaskColumn";
import { TASK_STATUS } from "../types/task";
import { Button } from "../components/common/Button";
import { BoardSettingsModal } from "../components/board/BoardSettingsModal";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { AppLayout } from "../App";

export const BoardPage = () => {
	const navigate = useNavigate();
	const idParams = useParams({ from: "/boards/$boardId" });
	const slugParams = useParams({ from: "/b/$slug" });
	const { user } = useAuth();
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

	// Get board ID or slug from URL
	const boardIdentifier = idParams.boardId || slugParams.slug;

	if (!boardIdentifier) {
		return (
			<AppLayout>
				<div className="text-center py-12">
					<p className="text-gray-500">Board not found</p>
				</div>
			</AppLayout>
		);
	}

	const {
		data: board,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["boards", boardIdentifier],
		queryFn: () => getBoard(boardIdentifier),
	});

	const handleCopyUrl = () => {
		if (!board?.slug) return;
		const url = `${window.location.origin}/b/${board.slug}`;
		navigator.clipboard.writeText(url).then(() => {
			toast.success("Board URL copied to clipboard");
		});
	};

	const handleDeleteBoard = async () => {
		if (!board) return;
		try {
			await deleteBoard(board.id);
			toast.success("Board deleted successfully");
			navigate({ to: "/boards" });
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete board",
			);
		}
	};

	if (isLoading) {
		return (
			<AppLayout>
				<div className="flex justify-center items-center h-64">
					<LoadingSpinner size="lg" />
				</div>
			</AppLayout>
		);
	}

	if (error) {
		return (
			<AppLayout>
				<div className="text-center py-12">
					<p className="text-red-500">
						{error instanceof Error ? error.message : "Failed to load board"}
					</p>
				</div>
			</AppLayout>
		);
	}

	if (!board) {
		return (
			<AppLayout>
				<div className="text-center py-12">
					<p className="text-gray-500">Board not found</p>
				</div>
			</AppLayout>
		);
	}

	const canManageBoard =
		user?.id === board.owner_id ||
		board.members?.some(
			(member) => member.user_id === user?.id && member.role === "admin",
		);

	return (
		<AppLayout>
			<div className="space-y-6">
				<div className="flex justify-between items-start">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">{board.name}</h1>
						{board.description && (
							<p className="mt-2 text-gray-600">{board.description}</p>
						)}
						<div className="mt-2 flex items-center gap-2">
							<span className="text-sm text-gray-500">
								{board.is_public ? "Public" : "Private"} board
							</span>
							<span className="text-gray-300">•</span>
							<button
								type="button"
								onClick={handleCopyUrl}
								className="text-sm text-blue-600 hover:text-blue-800"
							>
								Copy URL
							</button>
						</div>
					</div>
					<div className="flex items-center space-x-4">
						{canManageBoard && (
							<>
								<Button
									variant="outline"
									onClick={() => setIsSettingsOpen(true)}
								>
									Board Settings
								</Button>
								<Button
									variant="outline"
									className="!bg-red-50 !text-red-600 !border-red-200 hover:!bg-red-100"
									onClick={() => setIsDeleteConfirmOpen(true)}
								>
									Delete Board
								</Button>
							</>
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					{Object.values(TASK_STATUS).map((status) => {
						// Filter tasks for this column
						const tasksInColumn =
							board.tasks
								?.map((task) => ({
									...task,
									status_id: task.status_id || 0,
									priority_id: task.priority_id || 0,
									type_id: task.type_id || 0,
									order: task.order || 0,
								}))
								.filter((task) => task.status_id === status.id) || [];

						return (
							<TaskColumn
								key={status.columnId}
								status={status}
								tasks={tasksInColumn}
								onDrop={() => {}} // TODO: Implement task movement
								onEdit={() => {}} // TODO: Implement task editing
								onDelete={() => {}} // TODO: Implement task deletion
								isLoading={false}
							/>
						);
					})}
				</div>

				{isSettingsOpen && (
					<BoardSettingsModal
						isOpen={isSettingsOpen}
						onClose={() => setIsSettingsOpen(false)}
						board={board}
						onBoardDeleted={() => navigate({ to: "/boards" })}
					/>
				)}

				{/* Delete Confirmation Modal */}
				{isDeleteConfirmOpen && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
						<div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								Delete Board
							</h3>
							<p className="text-gray-500 mb-4">
								Are you sure you want to delete "{board.name}"? This action
								cannot be undone.
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
									className="!bg-red-600 hover:!bg-red-700"
									onClick={handleDeleteBoard}
								>
									Delete
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</AppLayout>
	);
};
