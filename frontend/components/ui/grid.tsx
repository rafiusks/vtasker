import * as React from "react";
import { cn } from "@/lib/utils";

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
	cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
	gap?: "none" | "sm" | "md" | "lg" | "xl";
	flow?: "row" | "col";
}

const gapClasses = {
	none: "",
	sm: "gap-2",
	md: "gap-4",
	lg: "gap-6",
	xl: "gap-8",
};

const colClasses = {
	1: "grid-cols-1",
	2: "grid-cols-2",
	3: "grid-cols-3",
	4: "grid-cols-4",
	5: "grid-cols-5",
	6: "grid-cols-6",
	7: "grid-cols-7",
	8: "grid-cols-8",
	9: "grid-cols-9",
	10: "grid-cols-10",
	11: "grid-cols-11",
	12: "grid-cols-12",
};

const flowClasses = {
	row: "grid-flow-row",
	col: "grid-flow-col",
};

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
	({ className, cols = 12, gap = "md", flow = "row", ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					"grid",
					colClasses[cols],
					gapClasses[gap],
					flowClasses[flow],
					className,
				)}
				{...props}
			/>
		);
	},
);
Grid.displayName = "Grid";

interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
	span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
	start?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

const spanClasses = {
	1: "col-span-1",
	2: "col-span-2",
	3: "col-span-3",
	4: "col-span-4",
	5: "col-span-5",
	6: "col-span-6",
	7: "col-span-7",
	8: "col-span-8",
	9: "col-span-9",
	10: "col-span-10",
	11: "col-span-11",
	12: "col-span-12",
};

const startClasses = {
	1: "col-start-1",
	2: "col-start-2",
	3: "col-start-3",
	4: "col-start-4",
	5: "col-start-5",
	6: "col-start-6",
	7: "col-start-7",
	8: "col-start-8",
	9: "col-start-9",
	10: "col-start-10",
	11: "col-start-11",
	12: "col-start-12",
};

export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
	({ className, span, start, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					span && spanClasses[span],
					start && startClasses[start],
					className,
				)}
				{...props}
			/>
		);
	},
);
GridItem.displayName = "GridItem";
