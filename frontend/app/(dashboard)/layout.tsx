"use client";

import { redirect } from "next/navigation";
import { MainNav } from "@/components/layout/main-nav";
import { UserNav } from "@/components/layout/user-nav";
import { SideNav } from "@/components/layout/side-nav";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isCollapsed] = useLocalStorage<boolean>("sidebar-collapsed", false);

	// TODO: Add authentication check
	// const session = await getSession();
	// if (!session) {
	//   redirect("/auth");
	// }

	return (
		<div className="flex min-h-screen flex-col">
			<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex h-14 items-center">
					<MainNav />
					<div className="flex flex-1 items-center justify-end space-x-4">
						<UserNav />
					</div>
				</div>
			</header>
			<div className="flex flex-1">
				<aside
					className={cn(
						"group fixed inset-y-0 left-0 mt-14 flex h-[calc(100vh-3.5rem)] flex-col border-r bg-background transition-all duration-300 ease-in-out",
						isCollapsed ? "w-16" : "w-72",
					)}
				>
					<SideNav />
				</aside>
				<main
					className={cn(
						"flex-1 transition-all duration-300 ease-in-out",
						isCollapsed ? "ml-16" : "ml-72",
					)}
				>
					<div className="container py-6">{children}</div>
				</main>
			</div>
		</div>
	);
}
