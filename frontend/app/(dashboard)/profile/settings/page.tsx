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
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { updateProfile } from "@/lib/api/auth";

interface SecuritySettings {
	twoFactorEnabled: boolean;
}

export default function SettingsPage() {
	const router = useRouter();
	const { toast } = useToast();
	const { isAuthenticated } = useAuth();
	const { theme, notifications, updateTheme, updatePreferences, isHydrated } =
		useUserPreferences();
	const [isLoading, setIsLoading] = useState(false);
	const [showSessionDialog, setShowSessionDialog] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
		twoFactorEnabled: false,
	});
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	// Prevent hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	const handleThemeChange = (value: "light" | "dark" | "system") => {
		updateTheme(value);
		setHasUnsavedChanges(true);
	};

	const handleNotificationChange = (
		type: keyof typeof notifications,
		checked: boolean,
	) => {
		updatePreferences({
			notifications: {
				...notifications,
				[type]: checked,
			},
		});
		setHasUnsavedChanges(true);
	};

	const handleSecurityChange = (
		setting: keyof SecuritySettings,
		value: boolean,
	) => {
		setSecuritySettings((prev) => ({
			...prev,
			[setting]: value,
		}));
		setHasUnsavedChanges(true);
	};

	const handleSaveChanges = async () => {
		setIsLoading(true);

		try {
			// Save all settings
			updatePreferences({
				theme,
				notifications,
			});

			// TODO: Implement security settings update
			if (securitySettings.twoFactorEnabled) {
				console.log("Would enable 2FA");
			}

			// Add a small delay to show the saving state
			await new Promise((resolve) => setTimeout(resolve, 500));

			setHasUnsavedChanges(false);
			toast({
				title: "Settings saved",
				description: "Your settings have been updated successfully.",
			});
		} catch (error) {
			console.error("Failed to save settings:", error);
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to save settings. Please try again.",
			});
			// Keep hasUnsavedChanges true if save failed
			setHasUnsavedChanges(true);
		} finally {
			setIsLoading(false);
		}
	};

	const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!isAuthenticated || !user) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "You must be logged in to update your profile.",
			});
			return;
		}

		setIsLoading(true);

		try {
			const formData = new FormData(e.currentTarget);
			const name = formData.get("name") as string;
			const email = formData.get("email") as string;

			console.log("Settings - Submitting profile update:", {
				name,
				email,
			});

			const response = await updateProfile({
				name,
				email,
			});

			console.log("Settings - Update response:", {
				error: response.error,
				data: response.data,
			});

			if (response.error) {
				throw new Error(response.error.message);
			}

			if (response.data) {
				updateAuthState(response.data);
				toast({
					title: "Profile updated",
					description: "Your profile has been updated successfully.",
				});
			} else {
				throw new Error("No data received from server");
			}
		} catch (error) {
			console.error("Settings - Profile update failed:", {
				error,
				message: error instanceof Error ? error.message : "Unknown error",
			});
			toast({
				variant: "destructive",
				title: "Error",
				description:
					error instanceof Error
						? error.message
						: "Failed to update profile. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Don't render anything until mounted and hydrated
	if (!mounted || !isHydrated) {
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
		<>
			<div className="space-y-6 p-6 lg:p-10">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">
							Application Settings
						</h2>
						<p className="text-muted-foreground">
							Manage your application preferences and security settings
						</p>
					</div>
					<Button
						onClick={handleSaveChanges}
						disabled={isLoading || !hasUnsavedChanges}
						className="min-w-[100px]"
					>
						{isLoading ? (
							<>
								<svg
									className="mr-2 h-4 w-4 animate-spin"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Saving...
							</>
						) : hasUnsavedChanges ? (
							"Save Changes"
						) : (
							"Saved"
						)}
					</Button>
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
									onValueChange={handleThemeChange}
									className="space-y-2"
									disabled={isLoading}
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
									checked={notifications.email}
									onCheckedChange={(checked) =>
										handleNotificationChange("email", checked)
									}
									disabled={isLoading}
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
									checked={notifications.taskReminders}
									onCheckedChange={(checked) =>
										handleNotificationChange("taskReminders", checked)
									}
									disabled={isLoading}
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
									checked={notifications.projectUpdates}
									onCheckedChange={(checked) =>
										handleNotificationChange("projectUpdates", checked)
									}
									disabled={isLoading}
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
								<Switch
									checked={securitySettings.twoFactorEnabled}
									onCheckedChange={(checked) =>
										handleSecurityChange("twoFactorEnabled", checked)
									}
									disabled={isLoading}
								/>
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
									disabled={isLoading}
									onClick={() => setShowSessionDialog(true)}
								>
									Manage Sessions
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Session Management</DialogTitle>
						<DialogDescription>
							View and manage your active sessions across different devices.
						</DialogDescription>
					</DialogHeader>
					<SessionManagement onClose={() => setShowSessionDialog(false)} />
				</DialogContent>
			</Dialog>
		</>
	);
}
