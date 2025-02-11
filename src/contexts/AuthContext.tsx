import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	useRef,
	type ReactNode,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import { setAuthToken, removeAuthToken, refreshToken } from "../api/auth";
import type { User, StoredAuthData } from "../types/auth";

interface AuthContextType {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	tokenReady: boolean;
	login: (
		token: string,
		refreshToken: string,
		user: User,
		expiresIn: number,
		refreshExpiresIn: number,
		rememberMe?: boolean,
	) => void;
	logout: () => void;
	updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

interface AuthProviderProps {
	children: ReactNode;
}

const REFRESH_THRESHOLD = 5 * 60; // Refresh token 5 minutes before expiry

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const navigate = useNavigate();
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [tokenReady, setTokenReady] = useState(false);
	const refreshTimeoutRef = useRef<number>();
	const tokenSetTimeoutRef = useRef<number>();

	// Function to safely set token and ensure it's ready
	const setTokenSafely = useCallback(async (newToken: string | null) => {
		if (newToken) {
			console.log(`Setting token: ${newToken.substring(0, 10)}...`);
			setToken(newToken);
			setAuthToken(newToken);
			// Small delay to ensure token is set in API client
			await new Promise((resolve) => setTimeout(resolve, 50));
			setTokenReady(true);
			console.log("Token is ready");
		} else {
			console.log("Removing token");
			setToken(null);
			removeAuthToken();
			setTokenReady(false);
		}
	}, []);

	// Cleanup function to handle logout
	const handleLogout = useCallback(() => {
		setTokenSafely(null);
		setUser(null);
		localStorage.removeItem("auth");
		sessionStorage.removeItem("auth");
		if (refreshTimeoutRef.current) {
			window.clearTimeout(refreshTimeoutRef.current);
		}
		if (tokenSetTimeoutRef.current) {
			window.clearTimeout(tokenSetTimeoutRef.current);
		}
		setIsLoading(false);
		navigate({ to: "/login", replace: true });
	}, [navigate, setTokenSafely]);

	// Handle token refresh
	const handleTokenRefresh = useCallback(
		async (storedData: StoredAuthData) => {
			try {
				console.log("Attempting token refresh with data:", {
					refreshToken: storedData.refresh_token ? "exists" : "missing",
					expiresAt: new Date(storedData.expiresAt).toISOString(),
					refreshExpiresAt: new Date(storedData.refreshExpiresAt).toISOString(),
					now: new Date().toISOString(),
				});

				const response = await refreshToken(storedData.refresh_token);
				const newExpiresAt = Date.now() + response.expires_in * 1000;

				// Update stored data
				const newStoredData: StoredAuthData = {
					...storedData,
					token: response.token,
					expiresAt: newExpiresAt,
				};

				// Update storage
				const storage = localStorage.getItem("auth")
					? localStorage
					: sessionStorage;
				storage.setItem("auth", JSON.stringify(newStoredData));

				// Update state and API client
				await setTokenSafely(response.token);

				// Schedule next refresh
				scheduleTokenRefresh(newStoredData);
				setIsLoading(false);
			} catch (error) {
				console.error("Token refresh failed:", error);
				handleLogout();
				setIsLoading(false);
			}
		},
		[handleLogout, setTokenSafely],
	);

	// Schedule token refresh
	const scheduleTokenRefresh = useCallback(
		(authData: StoredAuthData) => {
			if (refreshTimeoutRef.current) {
				window.clearTimeout(refreshTimeoutRef.current);
			}

			const now = Date.now();
			const timeUntilExpiry = authData.expiresAt - now;
			const timeUntilRefresh = Math.max(
				0,
				timeUntilExpiry - REFRESH_THRESHOLD * 1000,
			);

			console.log("Scheduling token refresh:", {
				timeUntilExpiry: `${Math.round(timeUntilExpiry / 1000)} seconds`,
				timeUntilRefresh: `${Math.round(timeUntilRefresh / 1000)} seconds`,
				expiresAt: new Date(authData.expiresAt).toISOString(),
				refreshExpiresAt: new Date(authData.refreshExpiresAt).toISOString(),
				now: new Date().toISOString(),
				refreshToken: authData.refresh_token ? "exists" : "missing",
			});

			if (timeUntilExpiry <= 0) {
				console.log("Token is expired, refreshing now");
				handleTokenRefresh(authData);
				return;
			}

			if (timeUntilExpiry <= REFRESH_THRESHOLD * 1000) {
				console.log("Token will expire soon, refreshing now");
				handleTokenRefresh(authData);
				return;
			}

			console.log(
				`Scheduling refresh in ${Math.round(timeUntilRefresh / 1000)} seconds`,
			);
			refreshTimeoutRef.current = window.setTimeout(() => {
				handleTokenRefresh(authData);
			}, timeUntilRefresh);
		},
		[handleTokenRefresh],
	);

	// Initialize auth state from storage
	useEffect(() => {
		let mounted = true;

		const initializeAuth = async () => {
			try {
				console.log("Initializing auth state...");
				// Check localStorage first (remember me)
				const storedAuth = localStorage.getItem("auth");
				if (storedAuth && mounted) {
					console.log("Found auth in localStorage");
					const data: StoredAuthData = JSON.parse(storedAuth);
					console.log("Auth data:", {
						hasToken: !!data.token,
						hasRefreshToken: !!data.refresh_token,
						expiresAt: new Date(data.expiresAt).toISOString(),
						refreshExpiresAt: new Date(data.refreshExpiresAt).toISOString(),
						now: new Date().toISOString(),
						user: data.user,
					});

					if (Date.now() >= data.refreshExpiresAt) {
						console.log("Refresh token expired, logging out");
						handleLogout();
						return;
					}

					if (Date.now() >= data.expiresAt) {
						console.log("Access token expired, refreshing");
						await handleTokenRefresh(data);
					} else {
						console.log(
							"Access token valid, setting token and scheduling refresh",
						);
						await setTokenSafely(data.token);
						if (mounted) {
							setUser(data.user);
							scheduleTokenRefresh(data);
						}
					}
					if (mounted) {
						setIsLoading(false);
					}
					return;
				}

				// Check sessionStorage (session-only)
				const sessionAuth = sessionStorage.getItem("auth");
				if (sessionAuth && mounted) {
					console.log("Found auth in sessionStorage");
					const data: StoredAuthData = JSON.parse(sessionAuth);
					console.log("Auth data:", {
						hasToken: !!data.token,
						hasRefreshToken: !!data.refresh_token,
						expiresAt: new Date(data.expiresAt).toISOString(),
						refreshExpiresAt: new Date(data.refreshExpiresAt).toISOString(),
						now: new Date().toISOString(),
						user: data.user,
					});

					if (Date.now() >= data.refreshExpiresAt) {
						console.log("Refresh token expired, logging out");
						handleLogout();
						return;
					}

					if (Date.now() >= data.expiresAt) {
						console.log("Access token expired, refreshing");
						await handleTokenRefresh(data);
					} else {
						console.log(
							"Access token valid, setting token and scheduling refresh",
						);
						await setTokenSafely(data.token);
						if (mounted) {
							setUser(data.user);
							scheduleTokenRefresh(data);
						}
					}
					if (mounted) {
						setIsLoading(false);
					}
					return;
				}

				console.log("No stored auth found");
				if (mounted) {
					setIsLoading(false);
				}
			} catch (error) {
				console.error("Error initializing auth:", error);
				if (mounted) {
					handleLogout();
					setIsLoading(false);
				}
			}
		};

		initializeAuth();

		return () => {
			mounted = false;
			if (refreshTimeoutRef.current) {
				window.clearTimeout(refreshTimeoutRef.current);
			}
			if (tokenSetTimeoutRef.current) {
				window.clearTimeout(tokenSetTimeoutRef.current);
			}
		};
	}, [handleLogout, handleTokenRefresh, scheduleTokenRefresh, setTokenSafely]);

	const login = useCallback(
		async (
			newToken: string,
			newRefreshToken: string,
			newUser: User,
			expiresIn: number,
			refreshExpiresIn: number,
			rememberMe = false,
		) => {
			try {
				console.log("Starting login process...");
				const expiresAt = Date.now() + expiresIn * 1000;
				const refreshExpiresAt = Date.now() + refreshExpiresIn * 1000;

				// Set token and wait for it to be ready
				await setTokenSafely(newToken);
				console.log("Token set successfully");

				// Set user state
				setUser(newUser);
				console.log("User state set:", newUser);

				// Prepare auth data
				const authData: StoredAuthData = {
					token: newToken,
					refresh_token: newRefreshToken,
					user: newUser,
					expiresAt,
					refreshExpiresAt,
				};

				// Store auth data
				const storage = rememberMe ? localStorage : sessionStorage;
				storage.setItem("auth", JSON.stringify(authData));
				console.log("Auth data stored");

				// Schedule token refresh
				scheduleTokenRefresh(authData);
				console.log("Token refresh scheduled");

				// Update loading state
				setIsLoading(false);
			} catch (error) {
				console.error("Login process failed:", error);
				handleLogout();
			}
		},
		[scheduleTokenRefresh, setTokenSafely, handleLogout],
	);

	const updateUser = useCallback(
		async (updates: Partial<User>) => {
			if (!user) return;

			try {
				const storage = localStorage.getItem("auth")
					? localStorage
					: sessionStorage;

				const authData = JSON.parse(storage.getItem("auth") || "{}");
				const updatedUser = { ...user, ...updates };

				// Update storage
				storage.setItem(
					"auth",
					JSON.stringify({
						...authData,
						user: updatedUser,
					}),
				);

				// Update state
				setUser(updatedUser);
			} catch (error) {
				console.error("Failed to update user:", error);
				throw error;
			}
		},
		[user],
	);

	const value = {
		user,
		token,
		isAuthenticated: !!token,
		isLoading,
		tokenReady,
		login,
		logout: handleLogout,
		updateUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
