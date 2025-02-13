import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../contexts/auth/context";
import { LoadingSpinner } from "../common/LoadingSpinner";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const { isAuthenticated, isLoading } = useAuth();
	const navigate = useNavigate();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner />
			</div>
		);
	}

	if (!isAuthenticated) {
		// Redirect to login page but save the attempted url
		navigate({ to: "/login", replace: true });
		return null;
	}

	return <>{children}</>;
};
