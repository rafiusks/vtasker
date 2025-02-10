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
				const response = await refreshToken(storedData.refreshToken);
				const newExpiresAt = Date.now() + response.expiresIn * 1000;

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
			const timeUntilRefresh =
				authData.expiresAt - now - REFRESH_THRESHOLD * 1000;

			if (timeUntilRefresh <= 0) {
				// Token is already expired or about to expire
				handleTokenRefresh(authData);
				return;
			}

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
					const data: StoredAuthData = JSON.parse(storedAuth);

					if (Date.now() >= data.refreshExpiresAt) {
						handleLogout();
						return;
					}

					if (Date.now() >= data.expiresAt) {
						handleTokenRefresh(data);
					} else {
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
					const data: StoredAuthData = JSON.parse(sessionAuth);

					if (Date.now() >= data.refreshExpiresAt) {
						handleLogout();
						return;
					}

					if (Date.now() >= data.expiresAt) {
						handleTokenRefresh(data);
					} else {
						setToken(data.token);
						setUser(data.user);
						setAuthToken(data.token);
						scheduleTokenRefresh(data);
					}
					return;
				}
			} catch (error) {
				console.error("Error initializing auth:", error);
				handleLogout();
			} finally {
				setIsLoading(false);
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
				refreshToken: newRefreshToken,
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
