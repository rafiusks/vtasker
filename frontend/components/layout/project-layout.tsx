"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
	Star,
	ChevronDown,
	Settings,
	Users,
	LayoutGrid,
	List,
	Clock,
} from "lucide-react";

interface ProjectNavItem {
	icon: React.ReactNode;
	label: string;
	value: string;
	isActive?: boolean;
	onClick?: () => void;
}

interface ProjectLayoutProps {
	children: React.ReactNode;
	className?: string;
	projectName?: string;
	projectKey?: string;
	navItems?: ProjectNavItem[];
	defaultView?: string;
	onViewChange?: (view: string) => void;
	onStarProject?: () => void;
	isStarred?: boolean;
	onTeamClick?: () => void;
	onSettingsClick?: () => void;
}

const defaultNavItems: ProjectNavItem[] = [
	{
		icon: <LayoutGrid className="h-4 w-4" />,
		label: "Kanban Board",
		value: "board",
	},
	{
		icon: <List className="h-4 w-4" />,
		label: "List",
		value: "list",
	},
	{
		icon: <Clock className="h-4 w-4" />,
		label: "Timeline",
		value: "timeline",
	},
];

export function ProjectLayout({
	children,
	className,
	projectName = "Project Name",
	projectKey = "PRJ",
	navItems = defaultNavItems,
	defaultView = "board",
	onViewChange,
	onStarProject,
	isStarred = false,
	onTeamClick,
	onSettingsClick,
}: ProjectLayoutProps) {
	const [activeView, setActiveView] = React.useState(defaultView);

	const handleViewChange = (view: string) => {
		setActiveView(view);
		onViewChange?.(view);
	};

	// Enhance nav items with active state and click handler
	const enhancedNavItems = navItems.map((item) => ({
		...item,
		isActive: item.value === activeView,
		onClick: () => handleViewChange(item.value),
	}));

	return (
		<div className="relative flex min-h-screen">
			{/* Fixed Sidebar */}
			<Sidebar className="fixed inset-y-0 left-0 z-50 w-72 border-r" />

			{/* Main Content Area */}
			<div className="flex-1 lg:pl-72">
				{/* Header */}
				<Header showLogo={false} />

				{/* Project Context Bar */}
				<div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					{/* Project Header */}
					<div className="flex h-14 items-center gap-4 px-6">
						<div className="flex items-center gap-3">
							<Button
								variant="ghost"
								size="icon"
								onClick={onStarProject}
								className={cn(isStarred && "text-yellow-500")}
							>
								<Star className="h-4 w-4" />
							</Button>
							<div>
								<h1 className="text-lg font-semibold leading-none">
									{projectName}
								</h1>
								<p className="text-sm text-muted-foreground">{projectKey}</p>
							</div>
						</div>

						<div className="ml-auto flex items-center gap-2">
							<Button variant="ghost" size="sm" onClick={onTeamClick}>
								<Users className="mr-2 h-4 w-4" />
								Team
							</Button>
							<Button variant="ghost" size="sm" onClick={onSettingsClick}>
								<Settings className="mr-2 h-4 w-4" />
								Project settings
							</Button>
						</div>
					</div>

					{/* Project Navigation */}
					<ScrollArea className="h-12 border-t">
						<div className="flex h-12 items-center gap-1 px-2">
							{enhancedNavItems.map((item) => (
								<Button
									key={item.value}
									variant={item.isActive ? "secondary" : "ghost"}
									size="sm"
									className="h-9"
									onClick={item.onClick}
								>
									{item.icon}
									<span className="ml-2">{item.label}</span>
								</Button>
							))}
						</div>
					</ScrollArea>
				</div>

				{/* Main Content */}
				<main className="flex-1">
					<div className={cn("container py-6", className)}>{children}</div>
				</main>
			</div>
		</div>
	);
}
