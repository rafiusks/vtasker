"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
	const router = useRouter();
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);

	const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const formData = new FormData(e.currentTarget);
			const name = formData.get("name") as string;
			const email = formData.get("email") as string;

			// TODO: Implement profile update
			toast({
				title: "Profile updated",
				description: "Your profile has been updated successfully.",
			});
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to update profile. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

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
										<AvatarImage src="/avatars/01.svg" alt="User avatar" />
										<AvatarFallback>U</AvatarFallback>
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
									defaultValue="User Name"
									disabled={isLoading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									defaultValue="user@example.com"
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
