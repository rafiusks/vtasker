"use client";

import {
	Cog6ToothIcon,
	HomeIcon,
	ServerIcon,
	ChartBarIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
	{ name: "Overview", href: "/", icon: HomeIcon },
	{ name: "Services", href: "/services", icon: ServerIcon },
	{ name: "Metrics", href: "/metrics", icon: ChartBarIcon },
	{ name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

export function Sidebar() {
	const pathname = usePathname();

	return (
		<div className="flex h-full w-64 flex-col border-r bg-background">
			<div className="flex flex-1 flex-col space-y-1 p-4">
				{navigation.map((item) => {
					const isActive = pathname === item.href;
					return (
						<Link
							key={item.name}
							href={item.href}
							className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
								isActive
									? "bg-primary text-primary-foreground"
									: "text-foreground hover:bg-muted"
							}`}
						>
							<item.icon
								className={`mr-3 h-5 w-5 flex-shrink-0 ${
									isActive ? "text-primary-foreground" : "text-muted-foreground"
								}`}
								aria-hidden="true"
							/>
							{item.name}
						</Link>
					);
				})}
			</div>
		</div>
	);
}
