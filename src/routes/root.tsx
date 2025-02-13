import { createRootRoute } from "@tanstack/react-router";
import { RootComponent } from "../components/layout/RootComponent";
import { RouteErrorComponent } from "../components/error/RouteErrorComponent";

// Create and export the root route
export const rootRoute = createRootRoute({
	component: RootComponent,
	errorComponent: RouteErrorComponent,
});
