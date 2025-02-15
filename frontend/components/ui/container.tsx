import * as React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
	size?: "sm" | "default" | "lg" | "fluid";
}

export function Container({
	className,
	size = "default",
	...props
}: ContainerProps) {
	return (
		<div
			className={cn(
				"mx-auto px-4 w-full",
				{
					"max-w-screen-md": size === "sm",
					"max-w-screen-lg": size === "default",
					"max-w-screen-xl": size === "lg",
					"max-w-none": size === "fluid",
				},
				className,
			)}
			{...props}
		/>
	);
}
