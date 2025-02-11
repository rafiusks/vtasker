import { Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Navbar } from "./Navbar";

interface AppLayoutProps {
	children?: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<main className="container mx-auto px-4 py-8">
				{children || <Outlet />}
			</main>
			<Toaster position="bottom-right" richColors closeButton />
		</div>
	);
};
