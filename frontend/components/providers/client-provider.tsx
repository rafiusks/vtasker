"use client";

import { useEffect, type ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "@/lib/api/provider";
import { useAuth } from "@/hooks/use-auth";

interface ClientProviderProps {
	children: ReactNode;
}

export function ClientProvider({ children }: ClientProviderProps) {
	const { initializeAuth } = useAuth();

	useEffect(() => {
		initializeAuth();
	}, [initializeAuth]);

	return (
		<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
			<QueryProvider>{children}</QueryProvider>
		</ThemeProvider>
	);
}
