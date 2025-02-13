import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { RegisterForm } from "../components/auth/RegisterForm";
import { useAuth } from "../contexts/auth/context";

export const RegisterPage = () => {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();

	// If user is already logged in, redirect to boards
	useEffect(() => {
		if (isAuthenticated) {
			navigate({ to: "/boards", replace: true });
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
					<RegisterForm />
				</div>
			</div>
		</div>
	);
};
