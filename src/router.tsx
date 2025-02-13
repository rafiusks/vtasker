import { createRouter } from "@tanstack/react-router";
import { NotFoundPage } from "./pages/NotFoundPage";
import { rootRoute } from "./routes/root";
import { indexRoute, loginRoute, registerRoute } from "./routes/public.routes";
import { dashboardRoute, dashboardSettingsRoute } from "./routes/dashboard.routes.tsx";
import { boardsRoute, boardRoute, boardSettingsRoute, taskRoute } from "./routes/board.routes.tsx";
import { superAdminRoute } from "./routes/admin.routes.tsx";

const routeTree = rootRoute.addChildren([
	indexRoute,
	loginRoute,
	registerRoute,
	dashboardRoute.addChildren([dashboardSettingsRoute]),
	boardsRoute,
	boardRoute.addChildren([taskRoute]),
	boardSettingsRoute,
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
