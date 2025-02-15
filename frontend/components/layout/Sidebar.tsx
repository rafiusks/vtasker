"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
	LayoutDashboard,
	ListTodo,
	Settings,
	Users,
	Menu,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
	className?: string;
}

interface NavItem {
	title: string;
	href: string;
	icon: React.ReactNode;
}

const navItems: NavItem[] = [
	{
		title: "Dashboard",
		href: "/dashboard",
		icon: <LayoutDashboard className="h-5 w-5" />,
	},
	{
		title: "Projects",
		href: "/projects",
		icon: <ListTodo className="h-5 w-5" />,
	},
	{
		title: "Team",
		href: "/team",
		icon: <Users className="h-5 w-5" />,
	},
	{
		title: "Settings",
		href: "/settings",
		icon: <Settings className="h-5 w-5" />,
	},
];

export function Sidebar({ className }: SidebarProps) {
	const pathname = usePathname();
	const [isMobileOpen, setIsMobileOpen] = React.useState(false);

	return (
		<>
			{/* Mobile Toggle Button */}
			<Button
				variant="ghost"
				size="icon"
				className="fixed left-4 top-4 z-50 lg:hidden"
				onClick={() => setIsMobileOpen(!isMobileOpen)}
			>
				{isMobileOpen ? (
					<X className="h-6 w-6" />
				) : (
					<Menu className="h-6 w-6" />
				)}
			</Button>

			{/* Backdrop */}
			{isMobileOpen && (
				<div
					className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
					onClick={() => setIsMobileOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-50 w-72 border-r bg-background transition-transform lg:translate-x-0",
					isMobileOpen ? "translate-x-0" : "-translate-x-full",
					className,
				)}
			>
				<div className="flex h-16 items-center border-b px-6">
					<Link href="/" className="flex items-center gap-2">
						<span className="text-xl font-bold">vTasker</span>
					</Link>
				</div>

				<ScrollArea className="flex h-[calc(100vh-4rem)] flex-col">
					<nav className="space-y-1 p-4">
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
									pathname === item.href
										? "bg-accent text-accent-foreground"
										: "text-muted-foreground",
								)}
							>
								{item.icon}
								{item.title}
							</Link>
						))}
					</nav>
				</ScrollArea>
			</aside>
		</>
	);
}
