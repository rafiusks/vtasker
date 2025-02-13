import { createRoute, redirect } from "@tanstack/react-router";
import { DashboardPage } from "../pages/DashboardPage";
import { SettingsPage } from "../pages/SettingsPage";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { checkAuthFromStorage } from "../utils/auth";
import { rootRoute } from "./root";

// Dashboard routes
export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
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

export const dashboardSettingsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/settings",
  component: () => (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  ),
}); 