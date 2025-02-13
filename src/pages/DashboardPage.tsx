import { useAuth } from "../contexts/auth/context";
import { useQuery } from "@tanstack/react-query";
import { boardAPI } from "../api/client";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "../components/common/Button";

export const DashboardPage = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const {
		data: boards,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["boards"],
		queryFn: () => boardAPI.listBoards(),
	});

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-64">
				<LoadingSpinner />
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-12">
				<p className="text-red-500">
					{error instanceof Error ? error.message : "Failed to load dashboard"}
				</p>
			</div>
		);
	}

	const hasBoards = boards && boards.length > 0;

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			{/* Welcome Section */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">
					{user?.full_name
						? `Welcome back, ${user.full_name}!`
						: "Welcome back!"}
				</h1>
				<p className="mt-2 text-gray-600">
					{!user?.full_name && (
						<>
							Please{" "}
							<Link
								to="/dashboard/settings"
								className="text-blue-600 hover:text-blue-800"
							>
								update your profile
							</Link>{" "}
							to set your name.
						</>
					)}
					{user?.full_name &&
						"Here's an overview of your tasks and activities."}
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{/* Recent Boards Widget */}
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-lg font-semibold text-gray-900">
							Recent Boards
						</h2>
						{hasBoards && (
							<Button
								variant="primary"
								data-testid="create-board-button"
								onClick={() => navigate({ to: "/boards" })}
							>
								Create Board
							</Button>
						)}
					</div>
					<div className="space-y-3" data-testid="boards-list">
						{hasBoards ? (
							boards.slice(0, 5).map((board) => (
								<Link
									key={board.id}
									to="/b/$boardSlug"
									params={{ boardSlug: board.slug }}
									search={{}}
									className="block p-3 rounded-md hover:bg-gray-50 transition-colors"
								>
									<div className="font-medium text-gray-900">{board.name}</div>
									{board.description && (
										<div className="text-sm text-gray-500 truncate">
											{board.description}
										</div>
									)}
								</Link>
							))
						) : (
							<div className="text-center py-8">
								<p className="text-gray-500 text-sm mb-4">No boards yet</p>
								<Button
									variant="primary"
									data-testid="create-first-board-button"
									onClick={() => navigate({ to: "/boards" })}
								>
									Create your first board
								</Button>
							</div>
						)}
					</div>
				</div>

				{/* Pending Tasks Widget - Placeholder */}
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Pending Tasks
					</h2>
					<p className="text-gray-500 text-sm">Coming soon</p>
				</div>

				{/* Assigned Tasks Widget - Placeholder */}
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Assigned to You
					</h2>
					<p className="text-gray-500 text-sm">Coming soon</p>
				</div>

				{/* Todo Widget - Placeholder */}
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Todo</h2>
					<p className="text-gray-500 text-sm">Coming soon</p>
				</div>

				{/* Suggested Tasks Widget - Placeholder */}
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Suggested Tasks
					</h2>
					<p className="text-gray-500 text-sm">Coming soon</p>
				</div>

				{/* Activity Feed Widget - Placeholder */}
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Recent Activity
					</h2>
					<p className="text-gray-500 text-sm">Coming soon</p>
				</div>
			</div>
		</div>
	);
};
