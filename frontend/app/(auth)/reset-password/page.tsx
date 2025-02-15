"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { PageLayout } from "@/components/layout/page-layout";

interface ResetPasswordFormData {
	password: string;
	confirmPassword: string;
}

export default function ResetPasswordPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<Partial<ResetPasswordFormData>>({});

	const token = searchParams?.get("token");

	if (!token) {
		return (
			<PageLayout>
				<div className="flex min-h-screen items-center justify-center p-4">
					<Card className="w-full max-w-md">
						<CardHeader className="space-y-1">
							<CardTitle className="text-2xl text-center">
								Invalid link
							</CardTitle>
							<p className="text-center text-muted-foreground">
								This password reset link is invalid or has expired.
							</p>
						</CardHeader>
						<CardContent>
							<div className="flex justify-center">
								<Button asChild>
									<a href="/forgot-password">Request new reset link</a>
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</PageLayout>
		);
	}

	const validateForm = (formData: ResetPasswordFormData) => {
		const newErrors: Partial<ResetPasswordFormData> = {};

		if (!formData.password) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		const formData = new FormData(e.currentTarget);
		const data: ResetPasswordFormData = {
			password: formData.get("password") as string,
			confirmPassword: formData.get("confirmPassword") as string,
		};

		if (!validateForm(data)) {
			setIsLoading(false);
			return;
		}

		try {
			// TODO: Implement reset password API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast({
				title: "Password reset successful",
				description:
					"Your password has been reset. Please sign in with your new password.",
			});

			router.push("/login");
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to reset password. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<PageLayout>
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl text-center">
							Reset your password
						</CardTitle>
						<p className="text-center text-muted-foreground">
							Enter your new password below
						</p>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<label
									htmlFor="password"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									New Password
								</label>
								<Input
									id="password"
									name="password"
									type="password"
									required
									disabled={isLoading}
								/>
								{errors.password && (
									<p className="text-sm text-destructive">{errors.password}</p>
								)}
							</div>
							<div className="space-y-2">
								<label
									htmlFor="confirmPassword"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Confirm New Password
								</label>
								<Input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									required
									disabled={isLoading}
								/>
								{errors.confirmPassword && (
									<p className="text-sm text-destructive">
										{errors.confirmPassword}
									</p>
								)}
							</div>
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Resetting password..." : "Reset password"}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</PageLayout>
	);
}
