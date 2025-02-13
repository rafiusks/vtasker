import { useAuth } from "../../contexts/auth/context";
import { Button } from "./Button";

export const Header = () => {
	const { user, logout } = useAuth();

	return (
		<header className="bg-white shadow">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
				<div className="flex justify-between items-center">
					<div className="flex items-center">
						<img className="h-8 w-auto" src="/logo.svg" alt="VTasker Logo" />
						<h1 className="ml-3 text-xl font-semibold text-gray-900">
							VTasker
						</h1>
					</div>

					<div className="flex items-center space-x-4">
						<div className="text-sm text-gray-700">{user?.full_name}</div>
						<Button variant="outline" onClick={logout} className="text-sm">
							Logout
						</Button>
					</div>
				</div>
			</div>
		</header>
	);
};
