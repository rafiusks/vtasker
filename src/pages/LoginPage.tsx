import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";

interface LocationState {
	message?: string;
}

export const LoginPage = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const state = location.state as LocationState;

	// If user is already logged in, redirect to tasks
	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			navigate("/tasks");
		}
	}, [navigate]);

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
					{state?.message && (
						<div className="mb-4 p-3 text-sm text-green-600 bg-green-50 rounded-md">
							{state.message}
						</div>
					)}
					<LoginForm />
				</div>
			</div>
		</div>
	);
};
