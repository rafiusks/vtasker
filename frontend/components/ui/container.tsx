import * as React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	size?: "default" | "fluid";
}

export function Container({
	children,
	className,
	size = "default",
	...props
}: ContainerProps) {
	return (
		<div
			className={cn(
				"mx-auto w-full",
				size === "default" ? "max-w-7xl px-4 sm:px-6 lg:px-8" : "px-4",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}
