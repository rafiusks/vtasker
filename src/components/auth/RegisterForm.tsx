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

	const [validationErrors, setValidationErrors] = useState({
		full_name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setError(""); // Clear error when user types
		setValidationErrors((prev) => ({ ...prev, [name]: "" })); // Clear field validation
	};

	const validateField = (name: string, value: string) => {
		switch (name) {
			case "full_name":
				return !value ? "Full name is required" : "";
			case "email":
				return !value
					? "Email is required"
					: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
						? "Invalid email format"
						: "";
			case "password":
				return !value
					? "Password is required"
					: value.length < 8
						? "Password must be at least 8 characters"
						: "";
			case "confirmPassword":
				return !value
					? "Please confirm your password"
					: value !== formData.password
						? "Passwords do not match"
						: "";
			default:
				return "";
		}
	};

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		const error = validateField(name, value);
		setValidationErrors((prev) => ({ ...prev, [name]: error }));
	};

	const validateForm = () => {
		const newErrors = {
			full_name: validateField("full_name", formData.full_name),
			email: validateField("email", formData.email),
			password: validateField("password", formData.password),
			confirmPassword: validateField(
				"confirmPassword",
				formData.confirmPassword,
			),
		};

		setValidationErrors(newErrors);
		return !Object.values(newErrors).some(Boolean);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) {
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			const response = await register(formData);
			console.log("Registration successful:", response);

			window.sessionStorage.setItem(
				"registerMessage",
				"Account created successfully",
			);

			// Use window.location.href to ensure a full page reload
			window.location.href = "/login";
		} catch (err) {
			console.error("Registration failed:", err);
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("Failed to register");
			}
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
					onBlur={handleBlur}
					required
					autoComplete="name"
					placeholder="Enter your full name"
					data-testid="fullname-input"
					error={validationErrors.full_name}
				/>

				<Input
					label="Email"
					type="email"
					name="email"
					value={formData.email}
					onChange={handleChange}
					onBlur={handleBlur}
					required
					autoComplete="email"
					placeholder="Enter your email"
					data-testid="email-input"
					error={validationErrors.email}
				/>

				<Input
					label="Password"
					type="password"
					name="password"
					value={formData.password}
					onChange={handleChange}
					onBlur={handleBlur}
					required
					autoComplete="new-password"
					placeholder="Create a password"
					data-testid="password-input"
					error={validationErrors.password}
				/>

				<Input
					label="Confirm Password"
					type="password"
					name="confirmPassword"
					value={formData.confirmPassword}
					onChange={handleChange}
					onBlur={handleBlur}
					required
					autoComplete="new-password"
					placeholder="Confirm your password"
					data-testid="confirm-password-input"
					error={validationErrors.confirmPassword}
				/>

				<Button
					type="submit"
					className="w-full"
					isLoading={isLoading}
					disabled={
						!formData.email || !formData.password || !formData.full_name
					}
					data-testid="register-button"
				>
					Create Account
				</Button>
			</form>
		</div>
	);
};
