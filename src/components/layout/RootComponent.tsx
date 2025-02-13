import { Outlet } from "@tanstack/react-router";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AuthProvider } from "../../contexts/auth/AuthProvider";

export const RootComponent = () => {
  return (
    <AuthProvider>
      <DndProvider backend={HTML5Backend}>
        <Outlet />
      </DndProvider>
    </AuthProvider>
  );
}; 