import {
	LayoutDashboard,
	ListTodo,
	Users,
	Settings,
	FolderKanban,
	Calendar,
	LineChart,
} from "lucide-react";

export interface Route {
	path: string;
	label: string;
	icon?: React.ComponentType<{ className?: string }>;
	children?: Route[];
}

export interface RouteGroup {
	label: string;
	routes: Route[];
}

export const mainRoutes: RouteGroup[] = [
	{
		label: "Overview",
		routes: [
			{
				path: "/dashboard",
				label: "Dashboard",
				icon: LayoutDashboard,
			},
			{
				path: "/projects",
				label: "Projects",
				icon: ListTodo,
			},
			{
				path: "/calendar",
				label: "Calendar",
				icon: Calendar,
			},
		],
	},
	{
		label: "Workspace",
		routes: [
			{
				path: "/team",
				label: "Team",
				icon: Users,
			},
			{
				path: "/analytics",
				label: "Analytics",
				icon: LineChart,
			},
			{
				path: "/settings",
				label: "Settings",
				icon: Settings,
			},
		],
	},
];

export const projectRoutes: Route[] = [
	{
		path: "/board",
		label: "Board",
		icon: FolderKanban,
	},
	{
		path: "/list",
		label: "List",
		icon: ListTodo,
	},
	{
		path: "/calendar",
		label: "Calendar",
		icon: Calendar,
	},
	{
		path: "/analytics",
		label: "Analytics",
		icon: LineChart,
	},
];

// Protected route paths
export const protectedPaths = [
	"/dashboard",
	"/projects",
	"/calendar",
	"/team",
	"/analytics",
	"/settings",
	"/projects/*", // All project sub-routes
];

// Public route paths
export const publicPaths = [
	"/",
	"/login",
	"/register",
	"/forgot-password",
	"/reset-password",
];
