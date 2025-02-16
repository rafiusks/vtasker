"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Settings, User, Bell, Lock, Palette } from "lucide-react";
import { useEffect, useState } from "react";

const items = [
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
];

export function SideNav() {
	const pathname = usePathname();
	const [currentHash, setCurrentHash] = useState("");

	// Update hash when it changes
	useEffect(() => {
		const updateHash = () => {
			setCurrentHash(window.location.hash);
		};

		// Set initial hash
		updateHash();

		// Listen for hash changes
		window.addEventListener("hashchange", updateHash);
		return () => window.removeEventListener("hashchange", updateHash);
	}, []);

	return (
		<nav className="grid items-start gap-2">
			{items.map((item) => (
				<div key={item.href}>
					<Link
						href={item.href}
						className={cn(
							"group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
							pathname === item.href ? "bg-accent" : "transparent",
						)}
					>
						<item.icon className="mr-2 h-4 w-4" />
						<span>{item.title}</span>
					</Link>
					{item.items?.length && (
						<div className="ml-4 mt-2 grid gap-1">
							{item.items.map((subItem) => (
								<Link
									key={subItem.href}
									href={subItem.href}
									className={cn(
										"group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
										pathname === item.href && subItem.href.endsWith(currentHash)
											? "bg-accent"
											: "transparent",
									)}
								>
									<subItem.icon className="mr-2 h-4 w-4" />
									<span>{subItem.title}</span>
								</Link>
							))}
						</div>
					)}
				</div>
			))}
		</nav>
	);
}
