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
import type {
	BoardPageParams,
	TaskPageParams,
	BoardLoaderData,
	TaskLoaderData,
} from "./types/router";
import { ProtectedComponent } from "./components/ProtectedComponent";
import { checkAuthFromStorage } from "./utils/auth";

// Helper function to check auth state
const isAuthenticated = () => {
	const { user } = useAuth();
	return !!user;
};

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

// Root route
const rootRoute = createRootRoute({
	component: RootComponent,
	notFoundComponent: NotFoundPage,
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
			throw new Response(null, {
				status: 302,
				headers: {
					Location: `/login?redirect=${encodeURIComponent(location.pathname)}`,
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
			throw new Response(null, {
				status: 302,
				headers: {
					Location: `/login?redirect=${encodeURIComponent(location.pathname)}`,
				},
			});
		}
	},
});

const boardsSettingsRoute = createRoute({
	getParentRoute: () => boardsRoute,
	path: "/settings",
	component: () => (
		<ProtectedComponent>
			<AppLayout>
				<SettingsPage />
			</AppLayout>
		</ProtectedComponent>
	),
});

const boardRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/b/$boardSlug",
	beforeLoad: async ({ location }) => {
		if (!checkAuthFromStorage()) {
			throw new Response(null, {
				status: 302,
				headers: {
					Location: `/login?redirect=${encodeURIComponent(location.pathname)}`,
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
	getParentRoute: () => boardRoute,
	path: "/settings",
	component: () => (
		<ProtectedComponent>
			<AppLayout>
				<SettingsPage />
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

const routeTree = rootRoute.addChildren([
	indexRoute,
	loginRoute,
	registerRoute,
	dashboardRoute.addChildren([dashboardSettingsRoute]),
	boardsRoute.addChildren([boardsSettingsRoute]),
	boardRoute.addChildren([boardSettingsRoute, taskRoute]),
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
