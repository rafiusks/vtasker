import { Link } from "@tanstack/react-router";
import { AppLayout } from "../components/layout/AppLayout";

export const NotFoundPage = () => {
	return (
		<AppLayout>
			<div className="min-h-[60vh] flex flex-col items-center justify-center">
				<h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
				<p className="text-xl text-gray-600 mb-8">Page not found</p>
				<p className="text-gray-500 mb-8">
					The page you're looking for doesn't exist or has been moved.
				</p>
				<Link
					to="/boards"
					className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
				>
					Go to Boards
				</Link>
			</div>
		</AppLayout>
	);
};
