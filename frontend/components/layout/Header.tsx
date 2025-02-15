"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

interface HeaderProps {
	className?: string;
	showLogo?: boolean;
	showSearch?: boolean;
	showUserMenu?: boolean;
}

export function Header({
	className,
	showLogo = false,
	showSearch = true,
	showUserMenu = true,
}: HeaderProps) {
	const handleClick = () => {
		console.log("Header button clicked");
	};

	return (
		<header
			className={cn(
				"sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
				className,
			)}
		>
			<div className="container flex h-16 items-center gap-4">
				{showLogo && (
					<Link href="/" className="flex items-center gap-2 lg:hidden">
						<span className="text-xl font-bold">vTasker</span>
					</Link>
				)}

				{showSearch && (
					<div className="flex-1">
						<div className="relative max-w-md">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								type="search"
								placeholder="Search..."
								className="w-full bg-background pl-8 lg:w-[300px]"
							/>
						</div>
					</div>
				)}

				<div className="flex items-center gap-2">
					{showUserMenu && (
						<>
							<Button
								variant="ghost"
								size="icon"
								className="relative"
								aria-label="Notifications"
							>
								<Bell className="h-4 w-4" />
								<span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
							</Button>

							<ThemeToggle />

							<Button
								variant="ghost"
								size="icon"
								className="relative h-8 w-8 rounded-full"
							>
								<span className="sr-only">Open user menu</span>
								<div className="h-8 w-8 rounded-full bg-muted" />
							</Button>
						</>
					)}
				</div>
			</div>
		</header>
	);
}
