import { Outlet, createRootRoute } from "@tanstack/react-router";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AuthProvider } from "../contexts/AuthContext";

// Root Layout Component
const RootComponent = () => {
	return (
		<AuthProvider>
			<DndProvider backend={HTML5Backend}>
				<Outlet />
			</DndProvider>
		</AuthProvider>
	);
};

// Create and export the root route
export const rootRoute = createRootRoute({
	component: RootComponent,
});
