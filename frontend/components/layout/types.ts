/**
 * Common types for layout components
 */

export interface LayoutProps {
	children: React.ReactNode;
	className?: string;
}

export interface HeaderProps {
	className?: string;
	showLogo?: boolean;
	showNav?: boolean;
	showSearch?: boolean;
	showUserMenu?: boolean;
}

export interface SidebarProps {
	className?: string;
	collapsed?: boolean;
	onCollapse?: (collapsed: boolean) => void;
}

export interface FooterProps {
	className?: string;
	showSocial?: boolean;
	showLinks?: boolean;
}
