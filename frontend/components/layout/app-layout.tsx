"use client";

import { cn } from "@/lib/utils";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
	children: React.ReactNode;
	showHeader?: boolean;
	showSidebar?: boolean;
	className?: string;
}

export function AppLayout({
	children,
	showHeader = true,
	showSidebar = true,
	className,
}: AppLayoutProps) {
	return (
		<div className="relative flex min-h-screen">
			{/* Sidebar */}
			{showSidebar && <Sidebar />}

			{/* Main Content */}
			<div className="flex-1">
				<div
					className={cn(
						"flex min-h-screen flex-col",
						showSidebar && "lg:pl-72",
						className,
					)}
				>
					{/* Header */}
					{showHeader && <Header />}

					{/* Main Content */}
					<main className="flex-1">
						<div className="container py-6">{children}</div>
					</main>
				</div>
			</div>
		</div>
	);
}
