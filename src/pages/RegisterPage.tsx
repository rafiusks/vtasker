import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterForm } from "../components/auth/RegisterForm";

export const RegisterPage = () => {
	const navigate = useNavigate();

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
					<RegisterForm />
				</div>
			</div>
		</div>
	);
};
