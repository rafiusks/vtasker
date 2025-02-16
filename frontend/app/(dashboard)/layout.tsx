"use client";

import { redirect } from "next/navigation";
import { MainNav } from "@/components/layout/main-nav";
import { UserNav } from "@/components/layout/user-nav";
import { SideNav } from "@/components/layout/side-nav";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
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
			<main className="flex-1">
				<div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
					<aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
						<div className="relative overflow-hidden py-6 pr-6 lg:py-8">
							<SideNav />
						</div>
					</aside>
					<div className="flex w-full flex-col overflow-hidden">{children}</div>
				</div>
			</main>
		</div>
	);
}
