import { createRoute, redirect } from "@tanstack/react-router";
import { SuperAdminDashboard } from "../pages/SuperAdminDashboard";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { checkAuthFromStorage } from "../utils/auth";
import { rootRoute } from "./root";

export const superAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/super-admin",
  component: () => (
    <ProtectedRoute>
      <SuperAdminDashboard />
    </ProtectedRoute>
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
      localStorage.getItem("auth") || sessionStorage.getItem("auth") || "{}"
    );

    if (!auth?.user?.role_code || auth.user.role_code !== "super_admin") {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
}); 