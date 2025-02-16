"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
	Settings,
	User,
	Bell,
	Lock,
	Palette,
	LayoutDashboard,
	FolderKanban,
	ListTodo,
	Users,
	BarChart,
	ChevronLeft,
	ChevronRight,
	Menu,
	Plus,
	AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";

interface NavItem {
	title: string;
	href: string;
	icon: LucideIcon;
	items?: NavItem[];
}

type NavigationConfig = {
	[key: string]: NavItem[];
};

// Navigation configurations for different sections
const navigationConfig: NavigationConfig = {
	dashboard: [
		{
			title: "Overview",
			href: "/dashboard",
			icon: LayoutDashboard,
		},
		{
			title: "Analytics",
			href: "/dashboard/analytics",
			icon: BarChart,
		},
	],
	projects: [
		{
			title: "All Projects",
			href: "/projects",
			icon: FolderKanban,
		},
		{
			title: "Active Issues",
			href: "/projects/active-issues",
			icon: ListTodo,
		},
		{
			title: "High Priority",
			href: "/projects/high-priority",
			icon: AlertCircle,
		},
		{
			title: "Team",
			href: "/projects/team",
			icon: Users,
		},
	],
	profile: [
		{
			title: "Profile",
			href: "/profile",
			icon: User,
		},
		{
			title: "Settings",
			href: "/profile/settings",
			icon: Settings,
			items: [
				{
					title: "Theme",
					href: "/profile/settings#theme",
					icon: Palette,
				},
				{
					title: "Notifications",
					href: "/profile/settings#notifications",
					icon: Bell,
				},
				{
					title: "Security",
					href: "/profile/settings#security",
					icon: Lock,
				},
			],
		},
	],
};

export function SideNav() {
	const pathname = usePathname() || "/";
	const section = pathname.split("/")[1] || "dashboard";
	const [mounted, setMounted] = React.useState(false);
	const [isCollapsed, setIsCollapsed] = useLocalStorage<boolean>(
		"sidebar-collapsed",
		false,
	);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	// Use the default state for server-side rendering and initial client render
	const sidebarCollapsed = mounted ? isCollapsed : false;

	// Get the navigation items for the current section
	const items = navigationConfig[section] || [];

	// Function to check if a link is active
	const isActive = (href: string) => {
		if (href.includes("#")) {
			const [path, hash] = href.split("#");
			return pathname === path && window.location.hash === `#${hash}`;
		}
		return pathname === href;
	};

	// Function to check if a section is active (for items with subitems)
	const isSectionActive = (item: NavItem) => {
		if (item.items) {
			return item.items.some((subItem) => isActive(subItem.href));
		}
		return isActive(item.href);
	};

	return (
		<>
			<div className="flex h-14 items-center justify-between border-b px-3">
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					onClick={() => setIsCollapsed(!isCollapsed)}
				>
					{sidebarCollapsed ? <Menu /> : <ChevronLeft />}
				</Button>
				{!sidebarCollapsed && (
					<Button variant="outline" size="sm" className="ml-auto">
						<Plus className="mr-2 h-4 w-4" />
						New
					</Button>
				)}
			</div>
			<nav className="flex-1 space-y-1 p-2">
				{items.map((item) => (
					<div key={item.href}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Link
									href={item.href}
									className={cn(
										"group relative flex h-10 w-full items-center rounded-lg px-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
										isSectionActive(item)
											? "bg-accent text-accent-foreground"
											: "text-muted-foreground hover:text-foreground",
									)}
								>
									<div
										className={cn(
											"flex h-8 w-8 items-center justify-center rounded-lg",
											isSectionActive(item)
												? "text-accent-foreground"
												: "text-muted-foreground group-hover:text-foreground",
										)}
									>
										{item.icon && <item.icon className="h-5 w-5" />}
									</div>
									{!sidebarCollapsed && (
										<span className="ml-2">{item.title}</span>
									)}
									{!sidebarCollapsed && item.items && (
										<ChevronRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:text-foreground" />
									)}
								</Link>
							</TooltipTrigger>
							{sidebarCollapsed && (
								<TooltipContent side="right" className="flex items-center">
									{item.title}
								</TooltipContent>
							)}
						</Tooltip>
						{!sidebarCollapsed && item.items && (
							<div className="mt-1 ml-10 space-y-1">
								{item.items.map((subItem) => (
									<Link
										key={subItem.href}
										href={subItem.href}
										className={cn(
											"group flex h-8 w-full items-center rounded-lg px-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
											isActive(subItem.href)
												? "bg-accent text-accent-foreground"
												: "text-muted-foreground hover:text-foreground",
										)}
									>
										<div
											className={cn(
												"flex h-6 w-6 items-center justify-center rounded-lg",
												isActive(subItem.href)
													? "text-accent-foreground"
													: "text-muted-foreground group-hover:text-foreground",
											)}
										>
											{subItem.icon && <subItem.icon className="h-4 w-4" />}
										</div>
										<span className="ml-2">{subItem.title}</span>
									</Link>
								))}
							</div>
						)}
					</div>
				))}
			</nav>
		</>
	);
}
