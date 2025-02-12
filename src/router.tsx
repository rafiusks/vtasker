import * as React from "react";
import {
	Outlet,
	createRootRoute,
	createRoute,
	createRouter,
} from "@tanstack/react-router";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AuthProvider } from "./contexts/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { BoardPage } from "./pages/BoardPage";
import { BoardsPage } from "./pages/BoardsPage";
import { useAuth } from "./contexts/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import { SettingsPage } from "./pages/SettingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { BoardSettingsPage } from "./pages/BoardSettingsPage";
import { ProtectedComponent } from "./components/ProtectedComponent";
import { checkAuthFromStorage } from "./utils/auth";
import type {
	BoardPageParams,
	TaskPageParams,
	BoardLoaderData,
	TaskLoaderData,
} from "./types/router";
import { SuperAdminDashboard } from "./pages/SuperAdminDashboard";
import { redirect } from "@tanstack/react-router";

// Helper function to check auth state
const isAuthenticated = () => {
	const { user } = useAuth();
	return !!user;
};

// Error component for route errors
const RouteErrorComponent = ({ error }: { error: unknown }) => {
	const errorMessage =
		error instanceof Error ? error.message : "An unexpected error occurred";
	return (
		<div className="min-h-screen bg-gray-100">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="min-h-[60vh] flex flex-col items-center justify-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						Something went wrong
					</h1>
					<p className="text-gray-600 mb-8">{errorMessage}</p>
					<a
						href="/"
						className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
					>
						Go Home
					</a>
				</div>
			</div>
		</div>
	);
};

// Create the root route
const rootRoute = createRootRoute({
	component: () => (
		<AuthProvider>
			<DndProvider backend={HTML5Backend}>
				<Outlet />
			</DndProvider>
		</AuthProvider>
	),
	errorComponent: RouteErrorComponent,
});

// Public routes
const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: LandingPage,
});

const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/login",
	component: LoginPage,
});

const registerRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/register",
	component: RegisterPage,
});

// Protected routes
const dashboardRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/dashboard",
	component: () => (
		<ProtectedComponent>
			<AppLayout>
				<DashboardPage />
			</AppLayout>
		</ProtectedComponent>
	),
	beforeLoad: async ({ location }) => {
		if (!checkAuthFromStorage()) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.pathname,
				},
			});
		}
	},
});

const dashboardSettingsRoute = createRoute({
	getParentRoute: () => dashboardRoute,
	path: "/settings",
	component: () => (
		<ProtectedComponent>
			<AppLayout>
				<SettingsPage />
			</AppLayout>
		</ProtectedComponent>
	),
});

const boardsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/boards",
	component: () => (
		<ProtectedComponent>
			<AppLayout>
				<BoardsPage />
			</AppLayout>
		</ProtectedComponent>
	),
	beforeLoad: async ({ location }) => {
		if (!checkAuthFromStorage()) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.pathname,
				},
			});
		}
	},
});

const boardRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/b/$boardSlug",
	beforeLoad: async ({ location }) => {
		if (!checkAuthFromStorage()) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.pathname,
				},
			});
		}
	},
	component: () => (
		<ProtectedComponent>
			<AppLayout>
				<BoardPage />
			</AppLayout>
		</ProtectedComponent>
	),
});

const boardSettingsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/b/$boardSlug/settings",
	beforeLoad: async ({ location }) => {
		if (!checkAuthFromStorage()) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.pathname,
				},
			});
		}
	},
	component: () => (
		<ProtectedComponent>
			<AppLayout>
				<BoardSettingsPage />
			</AppLayout>
		</ProtectedComponent>
	),
});

const taskRoute = createRoute({
	getParentRoute: () => boardRoute,
	path: "/$taskId",
	component: () => (
		<ProtectedComponent>
			<AppLayout>
				<BoardPage />
			</AppLayout>
		</ProtectedComponent>
	),
});

const settingsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/settings",
	component: () => (
		<ProtectedComponent>
			<AppLayout>
				<SettingsPage />
			</AppLayout>
		</ProtectedComponent>
	),
	beforeLoad: async ({ location }) => {
		if (!checkAuthFromStorage()) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.pathname,
				},
			});
		}
	},
});

const superAdminRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/super-admin",
	component: () => (
		<ProtectedComponent>
			<AppLayout>
				<SuperAdminDashboard />
			</AppLayout>
		</ProtectedComponent>
	),
	beforeLoad: async ({ location }) => {
		// First check if user is authenticated
		if (!checkAuthFromStorage()) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.pathname,
				},
			});
		}

		// Then check if user has super admin role
		const auth = JSON.parse(
			localStorage.getItem("auth") || sessionStorage.getItem("auth") || "{}",
		);

		if (!auth?.user?.role_code || auth.user.role_code !== "super_admin") {
			throw redirect({
				to: "/dashboard",
			});
		}
	},
});

const routeTree = rootRoute.addChildren([
	indexRoute,
	loginRoute,
	registerRoute,
	dashboardRoute.addChildren([dashboardSettingsRoute]),
	boardsRoute,
	boardRoute.addChildren([taskRoute]),
	boardSettingsRoute,
	settingsRoute,
	superAdminRoute,
]);

// Create and export the router
export const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	defaultNotFoundComponent: NotFoundPage,
});

// Register your router for maximum type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
