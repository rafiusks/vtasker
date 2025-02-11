import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./root.tsx";
import { SuperAdminDashboard } from "../pages/SuperAdminDashboard";
import { ProtectedComponent } from "../components/ProtectedComponent";

export const superAdminRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/super-admin",
	component: () => (
		<ProtectedComponent>
			<SuperAdminDashboard />
		</ProtectedComponent>
	),
});
