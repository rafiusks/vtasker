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
import { useAuth } from "./contexts/AuthContext";

// Helper function to check auth state
const isAuthenticated = () => {
	const authData =
		localStorage.getItem("auth") || sessionStorage.getItem("auth");
	return !!authData;
};

// Route state types
interface LoginRouteState {
	message?: string;
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
const ProtectedComponent: React.FC = () => {
	const { isAuthenticated: isAuth, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent" />
			</div>
		);
	}

	if (!isAuth) {
		throw redirect({ to: "/login" });
	}

	return <App />;
};

// Define routes
const rootRoute = new RootRoute({
	component: RootComponent,
});

const indexRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "/",
	beforeLoad: () => {
		throw redirect({ to: "/tasks" });
	},
});

const loginRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "/login",
	component: LoginPage,
	beforeLoad: () => {
		if (isAuthenticated()) {
			throw redirect({ to: "/tasks" });
		}
	},
});

const registerRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "/register",
	component: RegisterPage,
	beforeLoad: () => {
		if (isAuthenticated()) {
			throw redirect({ to: "/tasks" });
		}
	},
});

const tasksRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "/tasks",
	component: ProtectedComponent,
	beforeLoad: () => {
		if (!isAuthenticated()) {
			throw redirect({ to: "/login" });
		}
	},
});

const notFoundRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "*",
	beforeLoad: () => {
		throw redirect({ to: "/tasks" });
	},
});

// Create the router
const routeTree = rootRoute.addChildren([
	indexRoute,
	loginRoute,
	registerRoute,
	tasksRoute,
	notFoundRoute,
]);

export const router = new Router({
	routeTree,
	defaultPreload: "intent",
});
