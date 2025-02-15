"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import {
	ChevronLeft,
	ChevronRight,
	LayoutGrid,
	List,
	Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ViewOption {
	icon: React.ReactNode;
	label: string;
	value: string;
	isActive?: boolean;
	onClick?: () => void;
}

interface WorkspaceLayoutProps {
	children: React.ReactNode;
	className?: string;
	viewPanel?: React.ReactNode;
	breadcrumbs?: React.ReactNode;
	viewOptions?: ViewOption[];
	defaultView?: string;
	onViewChange?: (view: string) => void;
}

const defaultViewOptions: ViewOption[] = [
	{
		icon: <LayoutGrid className="h-4 w-4" />,
		label: "Board View",
		value: "board",
	},
	{
		icon: <List className="h-4 w-4" />,
		label: "List View",
		value: "list",
	},
	{
		icon: <Calendar className="h-4 w-4" />,
		label: "Calendar",
		value: "calendar",
	},
];

export function WorkspaceLayout({
	children,
	className,
	viewPanel,
	breadcrumbs,
	viewOptions = defaultViewOptions,
	defaultView = "board",
	onViewChange,
}: WorkspaceLayoutProps) {
	const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
	const [isViewPanelCollapsed, setIsViewPanelCollapsed] = React.useState(false);
	const [activeView, setActiveView] = React.useState(defaultView);

	const handleViewChange = (view: string) => {
		setActiveView(view);
		onViewChange?.(view);
	};

	// Enhance view options with active state and click handler
	const enhancedViewOptions = viewOptions.map((option) => ({
		...option,
		isActive: option.value === activeView,
		onClick: () => handleViewChange(option.value),
	}));

	return (
		<div className="relative flex min-h-screen">
			{/* Main Sidebar */}
			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-background transition-all duration-300",
					isSidebarCollapsed && "w-16",
				)}
			>
				{/* Logo Area */}
				<div className="flex h-16 items-center justify-between border-b px-4">
					{!isSidebarCollapsed && (
						<span className="text-xl font-bold">vTasker</span>
					)}
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
					>
						{isSidebarCollapsed ? (
							<ChevronRight className="h-4 w-4" />
						) : (
							<ChevronLeft className="h-4 w-4" />
						)}
					</Button>
				</div>

				{/* Sidebar Content */}
				<ScrollArea className="flex-1">
					<Sidebar className="border-none" />
				</ScrollArea>
			</aside>

			{/* Main Content Area */}
			<div
				className={cn(
					"flex-1 transition-all duration-300",
					isSidebarCollapsed ? "lg:pl-16" : "lg:pl-72",
				)}
			>
				{/* Header */}
				<Header showLogo={false} />

				{/* Breadcrumbs Bar */}
				{breadcrumbs && (
					<div className="border-b bg-background/95 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
						{breadcrumbs}
					</div>
				)}

				{/* Main Content with Optional View Panel */}
				<div className="flex min-h-[calc(100vh-4rem)]">
					{/* View Panel */}
					{viewPanel && (
						<aside
							className={cn(
								"w-60 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
								isViewPanelCollapsed && "w-16",
							)}
						>
							<div className="flex h-12 items-center justify-between border-b px-4">
								{!isViewPanelCollapsed && (
									<span className="font-medium">Views</span>
								)}
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setIsViewPanelCollapsed(!isViewPanelCollapsed)}
								>
									{isViewPanelCollapsed ? (
										<ChevronRight className="h-4 w-4" />
									) : (
										<ChevronLeft className="h-4 w-4" />
									)}
								</Button>
							</div>
							<ScrollArea className="h-[calc(100vh-7rem)]">
								<div className="space-y-1 p-2">
									{enhancedViewOptions.map((view) => (
										<Button
											key={view.value}
											variant={view.isActive ? "secondary" : "ghost"}
											className={cn(
												"w-full justify-start",
												isViewPanelCollapsed && "px-2",
											)}
											onClick={view.onClick}
										>
											{view.icon}
											{!isViewPanelCollapsed && (
												<span className="ml-2">{view.label}</span>
											)}
										</Button>
									))}
								</div>
								{!isViewPanelCollapsed && viewPanel}
							</ScrollArea>
						</aside>
					)}

					{/* Main Content */}
					<main className="flex-1">
						<div className="container py-6">{children}</div>
					</main>
				</div>
			</div>
		</div>
	);
}
