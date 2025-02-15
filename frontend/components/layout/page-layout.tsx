"use client";

import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	fullWidth?: boolean;
	noPadding?: boolean;
}

export function PageLayout({
	children,
	className,
	fullWidth = false,
	noPadding = false,
	...props
}: PageLayoutProps) {
	return (
		<main
			className={cn(
				"min-h-screen bg-background",
				!noPadding && "py-8",
				className,
			)}
			{...props}
		>
			<Container size={fullWidth ? "fluid" : "default"}>{children}</Container>
		</main>
	);
}
