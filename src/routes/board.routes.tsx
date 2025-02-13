import { createRoute, redirect } from "@tanstack/react-router";
import { BoardPage } from "../pages/BoardPage";
import { BoardsPage } from "../pages/BoardsPage";
import { BoardSettingsPage } from "../pages/BoardSettingsPage";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { checkAuthFromStorage } from "../utils/auth";
import { rootRoute } from "./root";

// Board routes
export const boardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/boards",
  component: () => (
    <ProtectedRoute>
      <BoardsPage />
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

export const boardRoute = createRoute({
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
    <ProtectedRoute>
      <BoardPage />
    </ProtectedRoute>
  ),
});

export const boardSettingsRoute = createRoute({
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
    <ProtectedRoute>
      <BoardSettingsPage />
    </ProtectedRoute>
  ),
});

export const taskRoute = createRoute({
  getParentRoute: () => boardRoute,
  path: "/$taskId",
  component: () => (
    <ProtectedRoute>
      <BoardPage />
    </ProtectedRoute>
  ),
}); 