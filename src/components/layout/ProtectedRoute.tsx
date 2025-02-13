import { AppLayout } from "./AppLayout";
import { ProtectedComponent } from "../ProtectedComponent";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return (
    <ProtectedComponent>
      <AppLayout>{children}</AppLayout>
    </ProtectedComponent>
  );
} 