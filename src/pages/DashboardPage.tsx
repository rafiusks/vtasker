import { useAuth } from "../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { boardAPI } from "../api/client";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Link } from "@tanstack/react-router";

export const DashboardPage = () => {
	const { user } = useAuth();
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

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			{/* Welcome Section */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">
					Welcome back, {user?.name}!
				</h1>
				<p className="mt-2 text-gray-600">
					Here's an overview of your tasks and activities.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{/* Recent Boards Widget */}
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Recent Boards
					</h2>
					{boards && boards.length > 0 ? (
						<div className="space-y-3">
							{boards.slice(0, 5).map((board) => (
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
							))}
						</div>
					) : (
						<p className="text-gray-500 text-sm">No boards yet</p>
					)}
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
