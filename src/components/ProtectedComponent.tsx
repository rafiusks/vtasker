import type { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { LoadingSpinner } from "./common/LoadingSpinner";

interface ProtectedComponentProps {
	children: ReactNode;
}

export const ProtectedComponent = ({ children }: ProtectedComponentProps) => {
	const { isAuthenticated: isAuth, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner />
			</div>
		);
	}

	if (!isAuth) {
		return null;
	}

	return <>{children}</>;
};
