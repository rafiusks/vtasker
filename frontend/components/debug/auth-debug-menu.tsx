"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

export function AuthDebugMenu() {
	const { isAuthenticated, user, initializeAuth } = useAuth();
	const [lastChecked, setLastChecked] = useState<Date>(new Date());
	const [token, setToken] = useState<string | null>(null);
	const [mounted, setMounted] = useState(false);
	const [logs, setLogs] = useState<
		Array<{ id: string; type: string; message: string; timestamp: Date }>
	>([]);
	const lastAuthState = useRef<string>("");

	// Add log with unique ID
	const addLog = useCallback((type: string, message: string) => {
		const id = Math.random().toString(36).substr(2, 9);
		setLogs((prev) => [
			...prev.slice(-19),
			{ id, type, message, timestamp: new Date() },
		]);
	}, []);

	useEffect(() => {
		setMounted(true);
		// Initialize auth state when component mounts
		initializeAuth().catch((error) => {
			console.error("Auth initialization error:", error);
			addLog("error", `Auth initialization error: ${error.message}`);
		});
	}, [initializeAuth, addLog]);

	useEffect(() => {
		if (!mounted) return;

		// Override console methods to capture logs
		const originalConsole = {
			log: console.log,
			error: console.error,
			warn: console.warn,
		};

		console.log = (...args) => {
			originalConsole.log(...args);
			if (
				args[0] &&
				typeof args[0] === "string" &&
				(args[0].toLowerCase().includes("auth") ||
					args[0].toLowerCase().includes("token"))
			) {
				const message = args
					.map((arg) =>
						typeof arg === "object"
							? JSON.stringify(arg, null, 2)
							: String(arg),
					)
					.join(" ");
				addLog("info", message);
			}
		};

		console.error = (...args) => {
			originalConsole.error(...args);
			if (
				args[0] &&
				typeof args[0] === "string" &&
				(args[0].toLowerCase().includes("auth") ||
					args[0].toLowerCase().includes("token"))
			) {
				const message = args
					.map((arg) =>
						typeof arg === "object"
							? JSON.stringify(arg, null, 2)
							: String(arg),
					)
					.join(" ");
				addLog("error", message);
			}
		};

		return () => {
			console.log = originalConsole.log;
			console.error = originalConsole.error;
		};
	}, [mounted, addLog]);

	useEffect(() => {
		if (!mounted) return;

		const checkAuth = () => {
			try {
				const localStorageToken =
					typeof window !== "undefined"
						? localStorage.getItem("auth_token")
						: null;
				const sessionStorageToken =
					typeof window !== "undefined"
						? sessionStorage.getItem("auth_token")
						: null;
				const cookieToken =
					typeof window !== "undefined"
						? document.cookie
								.split(";")
								.find((c) => c.trim().startsWith("auth_token="))
								?.split("=")[1] || null
						: null;

				const currentToken =
					localStorageToken || sessionStorageToken || cookieToken;

				// Only update if token state has changed
				if (currentToken !== token) {
					setToken(currentToken);
					addLog(
						"info",
						`Token state changed: ${token ? "present" : "none"} -> ${currentToken ? "present" : "none"}`,
					);
				}

				setLastChecked(new Date());

				const authState = {
					hasLocalStorage: !!localStorageToken,
					hasSessionStorage: !!sessionStorageToken,
					hasCookie: !!cookieToken,
					isAuthenticated,
				};

				// Log only if state has changed
				if (JSON.stringify(authState) !== lastAuthState.current) {
					console.log("Auth state:", authState);
					lastAuthState.current = JSON.stringify(authState);
				}

				// Re-initialize auth if token exists but not authenticated
				if (currentToken && !isAuthenticated) {
					addLog(
						"warn",
						"Token exists but not authenticated, re-initializing...",
					);
					initializeAuth().catch((error) => {
						addLog("error", `Re-initialization error: ${error.message}`);
					});
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error";
				addLog("error", `Auth check error: ${errorMessage}`);
			}
		};

		// Check immediately and then every 5 seconds
		checkAuth();
		const interval = setInterval(checkAuth, 5000);

		return () => clearInterval(interval);
	}, [isAuthenticated, mounted, initializeAuth, token, addLog]);

	// Don't render anything until mounted to avoid hydration issues
	if (!mounted) return null;

	return (
		<div className="fixed bottom-4 right-4 z-[9999]">
			<HoverCard>
				<HoverCardTrigger asChild>
					<Button
						variant="outline"
						size="icon"
						className={`shadow-lg ${
							isAuthenticated
								? "bg-green-500/20"
								: token
									? "bg-yellow-500/20"
									: "bg-red-500/20"
						}`}
					>
						{isAuthenticated ? (
							<ShieldCheck className="h-6 w-6 text-green-500" />
						) : token ? (
							<ShieldAlert className="h-6 w-6 text-yellow-500" />
						) : (
							<Shield className="h-6 w-6 text-red-500" />
						)}
					</Button>
				</HoverCardTrigger>
				<HoverCardContent
					className="w-[600px] shadow-lg"
					align="end"
					side="left"
				>
					<div className="space-y-2">
						<h4 className="font-medium">Auth Debug Info</h4>
						<div className="text-sm space-y-1">
							<p>
								Status:{" "}
								<span
									className={
										isAuthenticated ? "text-green-500" : "text-red-500"
									}
								>
									{isAuthenticated ? "Authenticated" : "Not Authenticated"}
								</span>
							</p>
							<p>
								Token Present:{" "}
								<span className={token ? "text-green-500" : "text-red-500"}>
									{token ? "Yes" : "No"}
								</span>
							</p>
							<p>
								Storage:{" "}
								{typeof window !== "undefined" &&
									(localStorage.getItem("auth_token")
										? "localStorage"
										: sessionStorage.getItem("auth_token")
											? "sessionStorage"
											: document.cookie.includes("auth_token")
												? "cookie"
												: "none")}
							</p>
							{user && (
								<>
									<p>User ID: {user.id}</p>
									<p>Email: {user.email}</p>
								</>
							)}
							<p className="text-xs text-muted-foreground">
								Last checked: {lastChecked.toLocaleTimeString()}
							</p>
							<p className="text-xs text-muted-foreground">
								Environment: {process.env.NODE_ENV}
							</p>
						</div>
						<div className="mt-4">
							<h5 className="text-sm font-medium mb-2">Recent Auth Logs</h5>
							<div className="max-h-[200px] overflow-y-auto space-y-1 bg-muted p-2 rounded-md text-xs font-mono">
								{logs.map((log) => (
									<div
										key={log.id}
										className={`${
											log.type === "error"
												? "text-red-500"
												: log.type === "warn"
													? "text-yellow-500"
													: "text-muted-foreground"
										}`}
									>
										[{log.timestamp.toLocaleTimeString()}] {log.message}
									</div>
								))}
								{logs.length === 0 && (
									<p className="text-muted-foreground">No logs yet...</p>
								)}
							</div>
						</div>
					</div>
				</HoverCardContent>
			</HoverCard>
		</div>
	);
}
