"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { SessionManagement } from "@/components/session-management";
import { useUserPreferences } from "@/lib/hooks/use-user-preferences";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SettingsPage() {
	const router = useRouter();
	const { toast } = useToast();
	const {
		theme,
		updateTheme,
		preferences,
		updatePreferences,
		isAuthenticated,
	} = useUserPreferences();
	const [isLoading, setIsLoading] = useState(false);
	const [showSessionDialog, setShowSessionDialog] = useState(false);
	const [mounted, setMounted] = useState(false);

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/auth");
		}
	}, [isAuthenticated, router]);

	// Prevent hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	const handleSavePreferences = async () => {
		if (!isAuthenticated) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "You must be logged in to save preferences.",
			});
			return;
		}

		setIsLoading(true);

		try {
			await updatePreferences({
				notifications: {
					email: preferences?.notifications.email ?? false,
					taskReminders: preferences?.notifications.taskReminders ?? false,
					projectUpdates: preferences?.notifications.projectUpdates ?? false,
				},
			});

			toast({
				title: "Preferences updated",
				description: "Your preferences have been updated successfully.",
			});
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to update preferences. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	if (!mounted || !isAuthenticated) {
		return null;
	}

	return (
		<>
			<div className="space-y-6 p-6 lg:p-10">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Settings</h2>
					<p className="text-muted-foreground">
						Manage your application preferences
					</p>
				</div>
				<Separator />
				<div className="grid gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Theme Preferences</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-4">
								<Label>Theme Mode</Label>
								<RadioGroup
									defaultValue={theme}
									value={theme}
									onValueChange={(value) =>
										updateTheme(value as "light" | "dark" | "system")
									}
									className="space-y-2"
									disabled={isLoading || !isAuthenticated}
								>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="light" id="theme-light" />
										<Label
											htmlFor="theme-light"
											className="font-normal cursor-pointer"
										>
											Light Mode (Default)
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="dark" id="theme-dark" />
										<Label
											htmlFor="theme-dark"
											className="font-normal cursor-pointer"
										>
											Dark Mode
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="system" id="theme-system" />
										<Label
											htmlFor="theme-system"
											className="font-normal cursor-pointer"
										>
											Follow System Theme
										</Label>
									</div>
								</RadioGroup>
								<p className="text-sm text-muted-foreground">
									Choose your preferred theme mode for the application
								</p>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Notification Settings</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Email Notifications</Label>
									<p className="text-sm text-muted-foreground">
										Receive email notifications for important updates
									</p>
								</div>
								<Switch
									checked={preferences?.notifications.email}
									onCheckedChange={(checked) =>
										updatePreferences({
											notifications: {
												email: checked,
												taskReminders:
													preferences?.notifications.taskReminders ?? false,
												projectUpdates:
													preferences?.notifications.projectUpdates ?? false,
											},
										})
									}
									disabled={isLoading || !isAuthenticated}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Task Reminders</Label>
									<p className="text-sm text-muted-foreground">
										Get notified about upcoming task deadlines
									</p>
								</div>
								<Switch
									checked={preferences?.notifications.taskReminders}
									onCheckedChange={(checked) =>
										updatePreferences({
											notifications: {
												email: preferences?.notifications.email ?? false,
												taskReminders: checked,
												projectUpdates:
													preferences?.notifications.projectUpdates ?? false,
											},
										})
									}
									disabled={isLoading || !isAuthenticated}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Project Updates</Label>
									<p className="text-sm text-muted-foreground">
										Receive notifications about project changes
									</p>
								</div>
								<Switch
									checked={preferences?.notifications.projectUpdates}
									onCheckedChange={(checked) =>
										updatePreferences({
											notifications: {
												email: preferences?.notifications.email ?? false,
												taskReminders:
													preferences?.notifications.taskReminders ?? false,
												projectUpdates: checked,
											},
										})
									}
									disabled={isLoading || !isAuthenticated}
								/>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Account Security</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Two-Factor Authentication</Label>
									<p className="text-sm text-muted-foreground">
										Enable 2FA for enhanced account security
									</p>
								</div>
								<Switch disabled={isLoading || !isAuthenticated} />
							</div>
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Session Management</Label>
									<p className="text-sm text-muted-foreground">
										View and manage active sessions
									</p>
								</div>
								<Button
									variant="outline"
									disabled={isLoading || !isAuthenticated}
									onClick={() => setShowSessionDialog(true)}
								>
									Manage Sessions
								</Button>
							</div>
						</CardContent>
					</Card>
					<div className="flex justify-end">
						<Button
							onClick={handleSavePreferences}
							disabled={isLoading || !isAuthenticated}
						>
							{isLoading ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</div>
			</div>

			<Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
				<DialogContent className="max-w-3xl">
					<DialogHeader>
						<DialogTitle>Session Management</DialogTitle>
						<DialogDescription>
							View and manage your active sessions across different devices. You
							can revoke access to individual devices or all devices at once.
						</DialogDescription>
					</DialogHeader>
					<SessionManagement />
				</DialogContent>
			</Dialog>
		</>
	);
}
