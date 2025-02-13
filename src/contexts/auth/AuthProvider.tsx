import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import { setAuthToken, removeAuthToken, refreshToken } from "../../api/auth";
import type { User, StoredAuthData } from "../../types/auth";
import type { AuthProviderProps } from "./types";
import { REFRESH_THRESHOLD } from "./types";
import { AuthContext } from "./context";

export function AuthProvider({ children }: AuthProviderProps) {
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
    localStorage.removeItem("tokenRefreshTimeout");
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

  // Schedule token refresh and handle token refresh
  const scheduleTokenRefresh = useCallback(
    async (authData: StoredAuthData) => {
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
        localStorage.removeItem("tokenRefreshTimeout");
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

      if (timeUntilExpiry <= 0 || timeUntilExpiry <= REFRESH_THRESHOLD * 1000) {
        try {
          console.log("Token expired or expiring soon, refreshing now");
          const response = await refreshToken(authData.refresh_token);
          const newExpiresAt = Date.now() + response.expires_in * 1000;

          // Update stored data
          const newStoredData: StoredAuthData = {
            ...authData,
            token: response.token,
            expiresAt: newExpiresAt,
            user: response.user || authData.user,
          };

          // Update storage
          const storage = localStorage.getItem("auth")
            ? localStorage
            : sessionStorage;
          storage.setItem("auth", JSON.stringify(newStoredData));

          // Update state and API client
          await setTokenSafely(response.token);
          if (response.user) {
            setUser(response.user);
          }

          // Schedule next refresh
          scheduleTokenRefresh(newStoredData);
        } catch (error) {
          console.error("Token refresh failed:", error);
          handleLogout();
        }
        return;
      }

      console.log(
        `Scheduling refresh in ${Math.round(timeUntilRefresh / 1000)} seconds`,
      );
      refreshTimeoutRef.current = window.setTimeout(() => {
        scheduleTokenRefresh(authData);
      }, timeUntilRefresh);

      // Store timeout ID in localStorage
      localStorage.setItem(
        "tokenRefreshTimeout",
        String(refreshTimeoutRef.current),
      );
    },
    [handleLogout, setTokenSafely],
  );

  // Initialize auth state from storage
  useEffect(() => {
    let mounted = true;
    const currentTokenTimeout = tokenSetTimeoutRef.current;

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
            await scheduleTokenRefresh(data);
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
            await scheduleTokenRefresh(data);
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
      if (currentTokenTimeout) {
        window.clearTimeout(currentTokenTimeout);
      }
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [handleLogout, scheduleTokenRefresh, setTokenSafely]);

  // Login function implementation
  const handleLogin = useCallback(
    async (
      token: string,
      refreshToken: string,
      user: User,
      expiresIn: number,
      refreshExpiresIn: number,
      rememberMe?: boolean,
    ) => {
      console.log("Starting login process...");
      const expiresAt = Date.now() + expiresIn * 1000;
      const refreshExpiresAt = Date.now() + refreshExpiresIn * 1000;

      const authData: StoredAuthData = {
        token,
        refresh_token: refreshToken,
        user,
        expiresAt,
        refreshExpiresAt,
      };

      // Store in appropriate storage based on remember me
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("auth", JSON.stringify(authData));
      console.log("Auth data stored");

      // Set token and user state
      await setTokenSafely(token);
      setUser(user);

      // Schedule token refresh
      scheduleTokenRefresh(authData);
      console.log("Token refresh scheduled");
    },
    [setTokenSafely, scheduleTokenRefresh],
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
    isAuthenticated: !!token && !!user,
    isLoading,
    tokenReady,
    login: handleLogin,
    logout: handleLogout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 