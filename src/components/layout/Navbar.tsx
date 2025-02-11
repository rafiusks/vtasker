import { Link } from "@tanstack/react-router";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../common/Button";

export const Navbar = () => {
	const { user, logout } = useAuth();

	return (
		<nav className="bg-white shadow">
			<div className="container mx-auto px-4">
				<div className="flex justify-between h-16">
					<div className="flex">
						<Link
							to="/boards"
							className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900"
						>
							<span className="text-xl font-bold">VTasker</span>
						</Link>
					</div>

					<div className="flex items-center">
						{user ? (
							<>
								<Link
									to="/boards"
									className="px-3 py-2 text-gray-700 hover:text-gray-900"
								>
									Boards
								</Link>
								<Link
									to="/settings"
									className="px-3 py-2 text-gray-700 hover:text-gray-900"
								>
									Settings
								</Link>
								<Button variant="outline" onClick={logout} className="ml-4">
									Logout
								</Button>
							</>
						) : (
							<>
								<Link
									to="/login"
									className="px-3 py-2 text-gray-700 hover:text-gray-900"
								>
									Login
								</Link>
								<Link
									to="/register"
									className="px-3 py-2 text-gray-700 hover:text-gray-900"
								>
									Register
								</Link>
							</>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
};
