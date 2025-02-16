"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
	Monitor,
	Smartphone,
	Tablet,
	Globe,
	XCircle,
	AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import * as authApi from "@/lib/api/auth";
import type { Session } from "@/lib/api/auth";

function getDeviceIcon(userAgent: string) {
	const ua = userAgent.toLowerCase();
	if (
		ua.includes("mobile") ||
		ua.includes("android") ||
		ua.includes("iphone")
	) {
		return <Smartphone className="h-4 w-4" />;
	}
	if (ua.includes("ipad") || ua.includes("tablet")) {
		return <Tablet className="h-4 w-4" />;
	}
	if (
		ua.includes("windows") ||
		ua.includes("macintosh") ||
		ua.includes("linux")
	) {
		return <Monitor className="h-4 w-4" />;
	}
	return <Globe className="h-4 w-4" />;
}

export function SessionManagement() {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [sessionToRevoke, setSessionToRevoke] = useState<Session | null>(null);

	const { data: sessions, isLoading } = useQuery({
		queryKey: ["sessions"],
		queryFn: async () => {
			const response = await authApi.listSessions();
			return response.data;
		},
	});

	const revokeMutation = useMutation({
		mutationFn: async (sessionId: string) => {
			await authApi.revokeSession(sessionId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sessions"] });
			toast({
				title: "Session revoked",
				description: "The session has been successfully terminated.",
			});
		},
		onError: () => {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to revoke session. Please try again.",
			});
		},
	});

	const revokeAllMutation = useMutation({
		mutationFn: async () => {
			await authApi.revokeAllSessions();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sessions"] });
			toast({
				title: "All sessions revoked",
				description: "All other sessions have been terminated.",
			});
		},
		onError: () => {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to revoke sessions. Please try again.",
			});
		},
	});

	const handleRevoke = (session: Session) => {
		setSessionToRevoke(session);
	};

	const confirmRevoke = () => {
		if (sessionToRevoke) {
			revokeMutation.mutate(sessionToRevoke.id);
			setSessionToRevoke(null);
		}
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Active Sessions</CardTitle>
					<CardDescription>Loading sessions...</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div>
					<CardTitle>Active Sessions</CardTitle>
					<CardDescription>
						Manage your active sessions across devices
					</CardDescription>
				</div>
				{sessions && sessions.length > 1 && (
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="outline" className="ml-4">
								Sign out all other devices
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Sign out all other devices?</AlertDialogTitle>
								<AlertDialogDescription>
									This will terminate all sessions except your current one.
									You'll need to sign in again on other devices.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={() => revokeAllMutation.mutate()}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									Sign out all
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				)}
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{sessions?.map((session) => (
						<div
							key={session.id}
							className="flex items-center justify-between space-x-4 rounded-lg border p-4"
						>
							<div className="flex items-center space-x-4">
								<div className="rounded-full bg-secondary p-2">
									{getDeviceIcon(session.userAgent)}
								</div>
								<div>
									<div className="font-medium">
										{session.current ? "Current session" : "Other device"}
									</div>
									<div className="text-sm text-muted-foreground">
										Last active:{" "}
										{formatDistanceToNow(new Date(session.lastUsed), {
											addSuffix: true,
										})}
									</div>
									<div className="text-xs text-muted-foreground">
										{session.ipAddress}
									</div>
								</div>
							</div>
							{!session.current && (
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleRevoke(session)}
										>
											<XCircle className="h-4 w-4" />
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Revoke this session?</AlertDialogTitle>
											<AlertDialogDescription>
												This will sign out this device immediately. You'll need
												to sign in again on that device.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancel</AlertDialogCancel>
											<AlertDialogAction
												onClick={confirmRevoke}
												className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
											>
												Revoke session
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							)}
						</div>
					))}
					{sessions?.length === 0 && (
						<div className="flex items-center space-x-4 rounded-lg border border-dashed p-4">
							<AlertCircle className="h-4 w-4 text-muted-foreground" />
							<div className="text-sm text-muted-foreground">
								No other active sessions found
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
