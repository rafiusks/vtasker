import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LoginForm } from "../components/auth/LoginForm";
import { useAuth } from "../contexts/AuthContext";

export const LoginPage = () => {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();
	const [message, setMessage] = useState<string | null>(null);

	// If user is already logged in, redirect to tasks
	useEffect(() => {
		if (isAuthenticated) {
			navigate({ to: "/tasks", replace: true });
		}

		// Check for registration message
		const registerMessage = sessionStorage.getItem("registerMessage");
		if (registerMessage) {
			setMessage(registerMessage);
			sessionStorage.removeItem("registerMessage");
		}
	}, [navigate, isAuthenticated]);

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<img
					className="mx-auto h-12 w-auto"
					src="/logo.svg"
					alt="VTasker Logo"
				/>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					{message && (
						<div className="mb-4 p-3 text-sm text-green-600 bg-green-50 rounded-md">
							{message}
						</div>
					)}
					<LoginForm />
				</div>
			</div>
		</div>
	);
};
