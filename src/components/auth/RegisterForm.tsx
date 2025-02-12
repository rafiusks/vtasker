import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { register } from "../../api/auth";
import type { UserCreate } from "../../types/auth";

export const RegisterForm = () => {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [formData, setFormData] = useState<UserCreate>({
		email: "",
		password: "",
		full_name: "",
		confirmPassword: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setError(""); // Clear error when user types
	};

	const validateForm = () => {
		if (!formData.email || !formData.password || !formData.full_name) {
			return "All fields are required";
		}
		if (formData.password.length < 8) {
			return "Password must be at least 8 characters long";
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			return "Please enter a valid email address";
		}
		return "";
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const validationError = validateForm();
		if (validationError) {
			setError(validationError);
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			await register(formData);
			// For now, we'll use window.location to pass the message
			window.sessionStorage.setItem(
				"registerMessage",
				"Registration successful! Please login.",
			);
			navigate({ to: "/login" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to register");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full max-w-md mx-auto">
			<form
				onSubmit={handleSubmit}
				className="space-y-6"
				data-testid="register-form"
			>
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900">
						Create an Account
					</h1>
					<p className="mt-2 text-sm text-gray-600">
						Already have an account?{" "}
						<a
							href="/login"
							className="font-medium text-blue-600 hover:text-blue-500"
							onClick={(e) => {
								e.preventDefault();
								navigate({ to: "/login" });
							}}
						>
							Login here
						</a>
					</p>
				</div>

				{error && (
					<div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
						{error}
					</div>
				)}

				<Input
					label="Full Name"
					type="text"
					name="full_name"
					value={formData.full_name}
					onChange={handleChange}
					required
					autoComplete="name"
					placeholder="Enter your full name"
					data-testid="name-input"
				/>

				<Input
					label="Email"
					type="email"
					name="email"
					value={formData.email}
					onChange={handleChange}
					required
					autoComplete="email"
					placeholder="Enter your email"
					data-testid="email-input"
				/>

				<Input
					label="Password"
					type="password"
					name="password"
					value={formData.password}
					onChange={handleChange}
					required
					autoComplete="new-password"
					placeholder="Create a password"
					data-testid="password-input"
				/>

				<Input
					label="Confirm Password"
					type="password"
					name="confirmPassword"
					value={formData.confirmPassword}
					onChange={handleChange}
					required
					autoComplete="new-password"
					placeholder="Confirm your password"
					data-testid="confirm-password-input"
				/>

				<Button
					type="submit"
					className="w-full"
					isLoading={isLoading}
					disabled={
						!formData.email || !formData.password || !formData.full_name
					}
				>
					Create Account
				</Button>
			</form>
		</div>
	);
};
