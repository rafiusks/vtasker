"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Laptop, Smartphone, Monitor, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";

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
import { Button } from "@/components/ui/button";
import { listSessions, revokeSession, revokeAllSessions } from "@/lib/api/auth";
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
	if (ua.includes("tablet") || ua.includes("ipad")) {
		return <Monitor className="h-4 w-4" />;
	}
	return <Laptop className="h-4 w-4" />;
}

export function SessionManagement() {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const { isAuthenticated } = useAuth();

	const {
		data: sessions = [],
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["sessions"],
		queryFn: async () => {
			if (!isAuthenticated) {
				throw new Error("You must be logged in to view sessions");
			}
			const response = await listSessions();
			if (response.error) {
				throw new Error(response.error.message);
			}
			return response.data || [];
		},
		enabled: isAuthenticated, // Only run query if authenticated
	});

	const { mutate: revoke, isPending: isRevoking } = useMutation({
		mutationFn: revokeSession,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sessions"] });
			toast({
				title: "Success",
				description: "Session revoked successfully",
			});
		},
		onError: () => {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to revoke session",
			});
		},
	});

	const { mutate: revokeAll, isPending: isRevokingAll } = useMutation({
		mutationFn: revokeAllSessions,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sessions"] });
			toast({
				title: "Success",
				description: "All sessions revoked successfully",
			});
		},
		onError: () => {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to revoke all sessions",
			});
		},
	});

	if (!isAuthenticated) {
		return (
			<div className="flex h-[200px] flex-col items-center justify-center gap-4 text-center">
				<div className="text-destructive">
					You must be logged in to view sessions
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex h-[200px] items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin" />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex h-[200px] flex-col items-center justify-center gap-4 text-center">
				<div className="text-destructive">
					{error instanceof Error ? error.message : "Failed to load sessions"}
				</div>
				<Button
					variant="outline"
					onClick={() =>
						queryClient.invalidateQueries({ queryKey: ["sessions"] })
					}
				>
					Try Again
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-medium">Active Sessions</h2>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant="destructive">Revoke All</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Revoke all active sessions?</AlertDialogTitle>
							<AlertDialogDescription>
								This will sign you out of all devices except the current one.
								You will need to sign in again on other devices.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => revokeAll()}
								disabled={isRevokingAll}
							>
								{isRevokingAll && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Revoke All
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
			<div className="divide-y rounded-md border">
				{sessions?.map((session) => (
					<div
						key={session.id}
						className="flex items-center justify-between p-4"
					>
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								{getDeviceIcon(session.userAgent)}
								<span className="font-medium">
									{session.current ? "Current Device" : "Device"}
								</span>
							</div>
							<div className="text-sm text-muted-foreground">
								Last used:{" "}
								{format(new Date(session.lastUsed), "MMM d, yyyy HH:mm")}
							</div>
							<div className="text-sm text-muted-foreground">
								IP: {session.ipAddress}
							</div>
						</div>
						{!session.current && (
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button variant="destructive" size="sm" disabled={isRevoking}>
										{isRevoking && (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										)}
										Revoke
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Revoke this session?</AlertDialogTitle>
										<AlertDialogDescription>
											This will sign out this device. The user will need to sign
											in again.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction
											onClick={() => revoke(session.id)}
											disabled={isRevoking}
										>
											{isRevoking && (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											)}
											Revoke
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
