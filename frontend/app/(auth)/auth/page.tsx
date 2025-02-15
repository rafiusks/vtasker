"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { PageLayout } from "@/components/layout/page-layout";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthMutations } from "@/hooks/use-auth-mutations";

type AuthStep = "email" | "login" | "register";

interface AuthFormData {
	email: string;
	name?: string;
	password: string;
}

export default function AuthPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { toast } = useToast();
	const [currentStep, setCurrentStep] = useState<AuthStep>("email");
	const [formData, setFormData] = useState<Partial<AuthFormData>>({});
	const { checkEmail, signIn, signUp } = useAuthMutations();

	const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			const email = new FormData(e.currentTarget).get("email") as string;
			setFormData({ ...formData, email });

			const { exists } = await checkEmail.mutateAsync(email);
			setCurrentStep(exists ? "login" : "register");
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "An error occurred. Please try again.",
			});
		}
	};

	const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			const password = new FormData(e.currentTarget).get("password") as string;
			const rememberMe = new FormData(e.currentTarget).get("remember") === "on";

			if (!formData.email) {
				throw new Error("Email is required");
			}

			await signIn.mutateAsync({
				email: formData.email,
				password,
				rememberMe,
			});

			toast({
				title: "Welcome back!",
				description: "You have been successfully logged in.",
			});

			const returnUrl = searchParams?.get("returnUrl") || "/dashboard";
			router.push(decodeURIComponent(returnUrl));
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Invalid credentials. Please try again.",
			});
		}
	};

	const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			const formDataObj = new FormData(e.currentTarget);
			const name = formDataObj.get("name") as string;
			const password = formDataObj.get("password") as string;

			if (!formData.email) {
				throw new Error("Email is required");
			}

			await signUp.mutateAsync({
				email: formData.email,
				password,
				name,
			});

			toast({
				title: "Account created!",
				description: "You have been successfully registered and logged in.",
			});

			const returnUrl = searchParams?.get("returnUrl") || "/dashboard";
			router.push(decodeURIComponent(returnUrl));
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "An error occurred during registration. Please try again.",
			});
		}
	};

	return (
		<PageLayout>
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl text-center">
							{currentStep === "email" && "Welcome"}
							{currentStep === "login" && "Welcome back"}
							{currentStep === "register" && "Create account"}
						</CardTitle>
						<p className="text-center text-muted-foreground">
							{currentStep === "email" && "Enter your email to continue"}
							{currentStep === "login" && "Enter your password to sign in"}
							{currentStep === "register" && "Complete your account setup"}
						</p>
					</CardHeader>
					<CardContent>
						{currentStep === "email" && (
							<form onSubmit={handleEmailSubmit} className="space-y-4">
								<div className="space-y-2">
									<label
										htmlFor="email"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										Email
									</label>
									<Input
										id="email"
										name="email"
										type="email"
										placeholder="m@example.com"
										required
										defaultValue={formData.email}
										disabled={checkEmail.isPending}
									/>
								</div>
								<Button
									type="submit"
									className="w-full"
									disabled={checkEmail.isPending}
								>
									{checkEmail.isPending ? "Checking..." : "Continue"}
								</Button>
							</form>
						)}

						{currentStep === "login" && (
							<form onSubmit={handleLoginSubmit} className="space-y-4">
								<div className="space-y-2">
									<label
										htmlFor="email"
										className="text-sm font-medium leading-none"
									>
										Email
									</label>
									<p className="text-sm text-muted-foreground">
										{formData.email}
									</p>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="password"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										Password
									</label>
									<Input
										id="password"
										name="password"
										type="password"
										required
										disabled={signIn.isPending}
									/>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="remember"
										name="remember"
										disabled={signIn.isPending}
									/>
									<label
										htmlFor="remember"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										Remember me
									</label>
								</div>
								<Button
									type="submit"
									className="w-full"
									disabled={signIn.isPending}
								>
									{signIn.isPending ? "Signing in..." : "Sign in"}
								</Button>
								<div className="flex justify-between">
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => setCurrentStep("email")}
										disabled={signIn.isPending}
									>
										← Back
									</Button>
									<Button
										type="button"
										variant="link"
										size="sm"
										onClick={() => router.push("/forgot-password")}
										disabled={signIn.isPending}
									>
										Forgot password?
									</Button>
								</div>
							</form>
						)}

						{currentStep === "register" && (
							<form onSubmit={handleRegisterSubmit} className="space-y-4">
								<div className="space-y-2">
									<label
										htmlFor="email"
										className="text-sm font-medium leading-none"
									>
										Email
									</label>
									<p className="text-sm text-muted-foreground">
										{formData.email}
									</p>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="name"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										Full Name
									</label>
									<Input
										id="name"
										name="name"
										type="text"
										required
										disabled={signUp.isPending}
									/>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="password"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										Password
									</label>
									<Input
										id="password"
										name="password"
										type="password"
										required
										disabled={signUp.isPending}
									/>
								</div>
								<Button
									type="submit"
									className="w-full"
									disabled={signUp.isPending}
								>
									{signUp.isPending ? "Creating account..." : "Create account"}
								</Button>
								<div className="flex justify-start">
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => setCurrentStep("email")}
										disabled={signUp.isPending}
									>
										← Back
									</Button>
								</div>
							</form>
						)}
					</CardContent>
				</Card>
			</div>
		</PageLayout>
	);
}
