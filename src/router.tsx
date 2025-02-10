import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { App } from "./App";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const RootLayout = () => {
	return (
		<AuthProvider>
			<DndProvider backend={HTML5Backend}>
				<Outlet />
			</DndProvider>
		</AuthProvider>
	);
};

export const router = createBrowserRouter([
	{
		element: <RootLayout />,
		children: [
			{
				path: "/",
				element: <Navigate to="/tasks" replace />,
			},
			{
				path: "/login",
				element: <LoginPage />,
			},
			{
				path: "/register",
				element: <RegisterPage />,
			},
			{
				path: "/tasks",
				element: (
					<ProtectedRoute>
						<App />
					</ProtectedRoute>
				),
			},
			{
				path: "*",
				element: <Navigate to="/tasks" replace />,
			},
		],
	},
]);
