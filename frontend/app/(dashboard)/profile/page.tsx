"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { getProfile, updateProfile } from "@/lib/api/auth";

export default function ProfilePage() {
	const router = useRouter();
	const { toast } = useToast();
	const { user, updateAuthState } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingProfile, setIsLoadingProfile] = useState(true);
	const [profileData, setProfileData] = useState(user);

	useEffect(() => {
		const loadProfile = async () => {
			try {
				const response = await getProfile();
				if (response.error) {
					throw new Error(response.error.message);
				}
				if (response.data) {
					setProfileData(response.data);
					updateAuthState(response.data);
				}
			} catch (error) {
				toast({
					variant: "destructive",
					title: "Error",
					description:
						error instanceof Error ? error.message : "Failed to load profile",
				});
			} finally {
				setIsLoadingProfile(false);
			}
		};

		loadProfile();
	}, [toast, updateAuthState]);

	const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const formData = new FormData(e.currentTarget);
			const name = formData.get("name") as string;
			const email = formData.get("email") as string;

			const token =
				localStorage.getItem("auth_token") ||
				sessionStorage.getItem("auth_token") ||
				document.cookie
					.split(";")
					.find((c) => c.trim().startsWith("auth_token="))
					?.split("=")[1];

			if (!token) {
				throw new Error("No authentication token found");
			}

			console.log("Profile Page - Submitting update:", {
				name,
				email,
				hasToken: !!token,
			});

			const response = await updateProfile({
				name,
				email,
			});

			console.log("Profile Page - Update response:", {
				error: response.error,
				data: response.data,
				status: response.error?.status,
				endpoint: response.error?.endpoint,
			});

			if (response.error) {
				throw new Error(response.error.message || "Failed to update profile");
			}

			if (!response.data) {
				throw new Error("No data received from server");
			}

			setProfileData(response.data);
			updateAuthState(response.data);
			toast({
				title: "Profile updated",
				description: "Your profile has been updated successfully.",
			});
		} catch (error) {
			console.error("Profile Page - Update failed:", {
				error,
				message: error instanceof Error ? error.message : "Unknown error",
				stack: error instanceof Error ? error.stack : undefined,
				type: error?.constructor?.name,
			});

			// Handle specific error cases
			const errorMessage =
				error instanceof Error ? error.message : "Failed to update profile";

			if (errorMessage.includes("No authentication token")) {
				router.push("/auth");
				return;
			}

			toast({
				variant: "destructive",
				title: "Error",
				description: errorMessage,
			});
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoadingProfile) {
		return (
			<div className="space-y-6 p-6 lg:p-10">
				<div className="flex items-center space-x-4">
					<div className="h-24 w-24 rounded-full bg-muted animate-pulse" />
					<div className="space-y-2">
						<div className="h-4 w-48 bg-muted animate-pulse rounded" />
						<div className="h-4 w-32 bg-muted animate-pulse rounded" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-6 lg:p-10">
			<div>
				<h2 className="text-2xl font-bold tracking-tight">Profile</h2>
				<p className="text-muted-foreground">
					Manage your account settings and preferences
				</p>
			</div>
			<Separator />
			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Personal Information</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleUpdateProfile} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="avatar">Profile Picture</Label>
								<div className="flex items-center space-x-4">
									<Avatar className="h-24 w-24">
										<AvatarImage
											src={
												typeof profileData?.avatar_url === "string"
													? profileData.avatar_url
													: "/avatars/01.svg"
											}
											alt={profileData?.name || "User avatar"}
										/>
										<AvatarFallback>
											{profileData?.name?.charAt(0).toUpperCase() || "U"}
										</AvatarFallback>
									</Avatar>
									<Button type="button" variant="outline" disabled={isLoading}>
										Change
									</Button>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="name">Full Name</Label>
								<Input
									id="name"
									name="name"
									defaultValue={profileData?.name || ""}
									disabled={isLoading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									defaultValue={profileData?.email || ""}
									disabled={isLoading}
								/>
							</div>
							<Button type="submit" disabled={isLoading}>
								{isLoading ? "Saving..." : "Save Changes"}
							</Button>
						</form>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Security</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="current-password">Current Password</Label>
							<Input
								id="current-password"
								name="current-password"
								type="password"
								disabled={isLoading}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="new-password">New Password</Label>
							<Input
								id="new-password"
								name="new-password"
								type="password"
								disabled={isLoading}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirm-password">Confirm New Password</Label>
							<Input
								id="confirm-password"
								name="confirm-password"
								type="password"
								disabled={isLoading}
							/>
						</div>
						<Button type="button" disabled={isLoading}>
							{isLoading ? "Updating..." : "Update Password"}
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
