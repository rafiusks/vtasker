import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingSpinner } from "../common/LoadingSpinner";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const { isAuthenticated, isLoading } = useAuth();
	const location = useLocation();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner size="lg" className="text-blue-600" />
			</div>
		);
	}

	if (!isAuthenticated) {
		// Redirect to login page but save the attempted url
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return <>{children}</>;
};
