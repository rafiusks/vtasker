import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Board } from "../../types/board";
import { useBoardQueries } from "../../hooks/useBoardQueries";
import { Button } from "../common/Button";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { CreateBoardModal } from "./CreateBoardModal";
import { cn } from "../../lib/utils";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "../../contexts/AuthContext";

export const BoardList = () => {
	const navigate = useNavigate();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	const { boards, isLoading, error } = useBoardQueries();

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-64">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-12">
				<p className="text-red-500">
					{error instanceof Error ? error.message : "Failed to load boards"}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6" data-testid="boards-list">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold text-gray-900">Your Boards</h2>
				<Button
					onClick={() => setIsCreateModalOpen(true)}
					data-testid="create-board-button"
				>
					Create Board
				</Button>
			</div>

			{boards?.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-gray-500">No boards found</p>
					<Button
						className="mt-4"
						onClick={() => setIsCreateModalOpen(true)}
						data-testid="create-board-button"
					>
						Create your first board
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{boards?.map((board) => (
						<BoardCard
							key={board.id}
							board={board}
							onClick={() =>
								navigate({
									to: "/b/$boardSlug",
									params: { boardSlug: board.slug },
									search: {},
								})
							}
						/>
					))}
				</div>
			)}

			{isCreateModalOpen && (
				<CreateBoardModal
					isOpen={isCreateModalOpen}
					onClose={() => setIsCreateModalOpen(false)}
				/>
			)}
		</div>
	);
};

interface BoardCardProps {
	board: Board;
	onClick: () => void;
}

const BoardCard = ({ board, onClick }: BoardCardProps) => {
	return (
		<button
			type="button"
			className="w-full text-left bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
			onClick={onClick}
		>
			<h3 className="text-lg font-semibold text-gray-900 mb-2">{board.name}</h3>
			{board.description && (
				<p className="text-gray-600 text-sm mb-4">{board.description}</p>
			)}
			<div className="flex items-center justify-between text-sm text-gray-500">
				<span>{board.is_public ? "Public" : "Private"}</span>
				<span>{board.tasks?.length || 0} tasks</span>
			</div>
		</button>
	);
};
