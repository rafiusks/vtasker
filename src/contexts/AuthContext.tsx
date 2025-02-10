import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	useRef,
	type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { setAuthToken, removeAuthToken, refreshToken } from "../api/auth";
import type { User, StoredAuthData } from "../types/auth";

interface AuthContextType {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (
		token: string,
		refreshToken: string,
		user: User,
		expiresIn: number,
		refreshExpiresIn: number,
		rememberMe?: boolean,
	) => void;
	logout: () => void;
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
	const refreshTimeoutRef = useRef<number>();

	// Cleanup function to handle logout
	const handleLogout = useCallback(() => {
		setToken(null);
		setUser(null);
		localStorage.removeItem("auth");
		sessionStorage.removeItem("auth");
		removeAuthToken();
		if (refreshTimeoutRef.current) {
			window.clearTimeout(refreshTimeoutRef.current);
		}
		navigate("/login");
	}, [navigate]);

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

				// Update state
				setToken(response.token);
				setAuthToken(response.token);

				// Schedule next refresh
				scheduleTokenRefresh(newStoredData);
			} catch (error) {
				console.error("Token refresh failed:", error);
				handleLogout();
			}
		},
		[handleLogout],
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
		const initializeAuth = () => {
			try {
				// Check localStorage first (remember me)
				const storedAuth = localStorage.getItem("auth");
				if (storedAuth) {
					console.log("Found auth in localStorage");
					const data: StoredAuthData = JSON.parse(storedAuth);

					if (Date.now() >= data.refreshExpiresAt) {
						console.log("Refresh token expired, logging out");
						handleLogout();
						return;
					}

					if (Date.now() >= data.expiresAt) {
						console.log("Access token expired, refreshing");
						handleTokenRefresh(data);
					} else {
						console.log("Access token valid, scheduling refresh");
						setToken(data.token);
						setUser(data.user);
						setAuthToken(data.token);
						scheduleTokenRefresh(data);
					}
					return;
				}

				// Check sessionStorage (session-only)
				const sessionAuth = sessionStorage.getItem("auth");
				if (sessionAuth) {
					console.log("Found auth in sessionStorage");
					const data: StoredAuthData = JSON.parse(sessionAuth);

					if (Date.now() >= data.refreshExpiresAt) {
						console.log("Refresh token expired, logging out");
						handleLogout();
						return;
					}

					if (Date.now() >= data.expiresAt) {
						console.log("Access token expired, refreshing");
						handleTokenRefresh(data);
					} else {
						console.log("Access token valid, scheduling refresh");
						setToken(data.token);
						setUser(data.user);
						setAuthToken(data.token);
						scheduleTokenRefresh(data);
					}
					return;
				}

				console.log("No stored auth found");
				setIsLoading(false);
			} catch (error) {
				console.error("Error initializing auth:", error);
				handleLogout();
			}
		};

		initializeAuth();

		return () => {
			if (refreshTimeoutRef.current) {
				window.clearTimeout(refreshTimeoutRef.current);
			}
		};
	}, [handleLogout, handleTokenRefresh, scheduleTokenRefresh]);

	const login = useCallback(
		(
			newToken: string,
			newRefreshToken: string,
			newUser: User,
			expiresIn: number,
			refreshExpiresIn: number,
			rememberMe = false,
		) => {
			const expiresAt = Date.now() + expiresIn * 1000;
			const refreshExpiresAt = Date.now() + refreshExpiresIn * 1000;

			setToken(newToken);
			setUser(newUser);
			setAuthToken(newToken);

			const authData: StoredAuthData = {
				token: newToken,
				refresh_token: newRefreshToken,
				user: newUser,
				expiresAt,
				refreshExpiresAt,
			};

			const storage = rememberMe ? localStorage : sessionStorage;
			storage.setItem("auth", JSON.stringify(authData));

			scheduleTokenRefresh(authData);
		},
		[scheduleTokenRefresh],
	);

	const value = {
		user,
		token,
		isAuthenticated: !!token,
		isLoading,
		login,
		logout: handleLogout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
