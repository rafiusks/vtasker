import * as React from "react";
import {
	Outlet,
	RootRoute,
	Route,
	Router,
	redirect,
} from "@tanstack/react-router";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AuthProvider } from "./contexts/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { App } from "./App";
import { BoardPage } from "./pages/BoardPage";
import { BoardsPage } from "./pages/BoardsPage";
import { useAuth } from "./contexts/AuthContext";
import {
	createRootRoute,
	createRoute,
	createRouter,
} from "@tanstack/react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { SettingsPage } from "./pages/SettingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import type { Router as TanstackRouter } from "@tanstack/react-router";

// Helper function to check auth state
const isAuthenticated = () => {
	const { user } = useAuth();
	return !!user;
};

// Helper function to check auth state from storage
const checkAuthFromStorage = () => {
	const storage = typeof window !== "undefined" ? window.localStorage : null;
	return !!storage?.getItem("auth");
};

// Route state types
interface LoginRouteState {
	message?: string;
}

interface BoardParams {
	boardId: string;
}

interface BoardSlugParams {
	slug: string;
}

interface LoginRouteSearch {
	redirect?:
		| "/"
		| "/login"
		| "/register"
		| "/boards"
		| "/boards/$boardId"
		| "/b/$slug"
		| "/settings";
}

// Root Layout Component
const RootComponent: React.FC = () => {
	return (
		<AuthProvider>
			<DndProvider backend={HTML5Backend}>
				<Outlet />
			</DndProvider>
		</AuthProvider>
	);
};

// Protected Route Component
const ProtectedComponent: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { isAuthenticated: isAuth, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent" />
			</div>
		);
	}

	if (!isAuth) {
		return null;
	}

	return <>{children}</>;
};

// Root route
export const rootRoute = createRootRoute({
	component: () => (
		<AuthProvider>
			<AppLayout />
		</AuthProvider>
	),
	notFoundComponent: () => <NotFoundPage />,
});

// Index route
export const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	beforeLoad: () => {
		const isAuth = checkAuthFromStorage();
		throw redirect({ to: isAuth ? "/boards" : "/login" });
	},
	component: () => null,
});

// Auth routes
export const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/login",
	validateSearch: (search: Record<string, unknown>): LoginRouteSearch => {
		const redirect = search.redirect as LoginRouteSearch["redirect"];
		return { redirect };
	},
	beforeLoad: () => {
		if (checkAuthFromStorage()) {
			throw redirect({ to: "/boards" });
		}
	},
	component: LoginPage,
});

export const registerRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/register",
	beforeLoad: () => {
		if (checkAuthFromStorage()) {
			throw redirect({ to: "/boards" });
		}
	},
	component: RegisterPage,
});

// Board routes
export const boardsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/boards",
	beforeLoad: () => {
		if (!checkAuthFromStorage()) {
			throw redirect({ to: "/login" });
		}
	},
	component: BoardsPage,
});

export const boardDetailRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/boards/$boardId",
	beforeLoad: () => {
		if (!checkAuthFromStorage()) {
			throw redirect({ to: "/login" });
		}
	},
	component: BoardPage,
});

export const boardBySlugRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/b/$slug",
	beforeLoad: () => {
		if (!checkAuthFromStorage()) {
			throw redirect({ to: "/login" });
		}
	},
	component: BoardPage,
});

// Settings route
export const settingsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/settings",
	beforeLoad: () => {
		if (!checkAuthFromStorage()) {
			throw redirect({ to: "/login" });
		}
	},
	component: SettingsPage,
});

// Create and export the router
export const routeTree = rootRoute.addChildren([
	indexRoute,
	loginRoute,
	registerRoute,
	boardsRoute,
	boardDetailRoute,
	boardBySlugRoute,
	settingsRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
