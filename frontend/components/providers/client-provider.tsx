"use client";

import { type ReactNode } from "react";
import { QueryProvider } from "@/lib/api/provider";
import { Button } from "@/components/ui/button";

interface ClientProviderProps {
	children: ReactNode;
}

export function ClientProvider({ children }: ClientProviderProps) {
	const handleClick = () => {
		console.log('ClientProvider button clicked');
	};

	return (
		<>
			<Button variant="outline" onClick={handleClick}>
				Client Button
			</Button>
			<QueryProvider>{children}</QueryProvider>
		</>
	);
}
