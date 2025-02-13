import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { login } from "../../api/auth";
import { useAuth } from "../../contexts/auth/context";
import type { UserLogin } from "../../types/auth";

export const LoginForm = () => {
	const navigate = useNavigate();
	const { login: authLogin } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [formData, setFormData] = useState<UserLogin>({
		email: "",
		password: "",
		rememberMe: false,
	});

	const [validationErrors, setValidationErrors] = useState({
		email: "",
		password: "",
	});

	const validateField = (name: string, value: string) => {
		switch (name) {
			case "email":
				return !value
					? "Email is required"
					: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
						? "Invalid email format"
						: "";
			case "password":
				return !value ? "Password is required" : "";
			default:
				return "";
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
		setError(""); // Clear error when user types
		setValidationErrors((prev) => ({ ...prev, [name]: "" })); // Clear field validation
	};

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		const error = validateField(name, value);
		setValidationErrors((prev) => ({ ...prev, [name]: error }));
	};

	const validateForm = () => {
		const newErrors = {
			email: validateField("email", formData.email),
			password: validateField("password", formData.password),
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
			const response = await login(formData);
			console.log("Login response:", response);
			await authLogin(
				response.token,
				response.refresh_token,
				response.user,
				response.expires_in,
				response.refresh_expires_in,
				formData.rememberMe,
			);

			// Handle redirect after successful login
			const params = new URLSearchParams(window.location.search);
			const redirectPath = params.get("redirect");
			if (redirectPath?.startsWith("/")) {
				try {
					navigate({ to: redirectPath, replace: true });
				} catch {
					// If navigation fails, fallback to dashboard
					navigate({ to: "/dashboard", replace: true });
				}
			} else {
				navigate({ to: "/dashboard", replace: true });
			}
		} catch (err) {
			console.error("Login error:", err);
			if (err instanceof Error) {
				if (err.message?.includes("401")) {
					setError("Invalid credentials");
				} else if (err.message?.includes("Failed to fetch")) {
					setError("Failed to login");
				} else {
					setError(err.message);
				}
			} else {
				setError("Failed to login");
			}
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full max-w-md mx-auto">
			<form
				onSubmit={handleSubmit}
				className="space-y-6"
				data-testid="login-form"
			>
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900">Login to VTasker</h1>
					<p className="mt-2 text-sm text-gray-600">
						Don&apos;t have an account?{" "}
						<a
							href="/register"
							className="font-medium text-blue-600 hover:text-blue-500"
							onClick={(e) => {
								e.preventDefault();
								navigate({ to: "/register" });
							}}
						>
							Register here
						</a>
					</p>
				</div>

				{error && (
					<div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
						{error}
					</div>
				)}

				<Input
					label="Email"
					type="email"
					name="email"
					value={formData?.email ?? ""}
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
					autoComplete="current-password"
					placeholder="Enter your password"
					data-testid="password-input"
					error={validationErrors.password}
				/>

				<div className="flex items-center justify-between">
					<label className="flex items-center">
						<input
							type="checkbox"
							name="rememberMe"
							checked={formData.rememberMe}
							onChange={handleChange}
							className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<span className="ml-2 block text-sm text-gray-900">
							Remember me
						</span>
					</label>

					{/* Temporarily hide forgot password link until route is implemented */}
					{/* <a
						href="/forgot-password"
						className="text-sm font-medium text-blue-600 hover:text-blue-500"
						onClick={(e) => {
							e.preventDefault();
							navigate({ to: "/forgot-password" });
						}}
					>
						Forgot your password?
					</a> */}
				</div>

				<Button
					type="submit"
					className="w-full"
					isLoading={isLoading}
					disabled={!formData.email || !formData.password}
					data-testid="login-button"
				>
					Login
				</Button>
			</form>
		</div>
	);
};
