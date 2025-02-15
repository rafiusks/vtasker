"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { ToastProvider } from "@/components/providers/toast-provider";
import { ClientProvider } from "@/components/providers/client-provider";
import { ErrorBoundary } from "@/components/error/error-boundary";

export function Providers({ children }: ThemeProviderProps) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<ErrorBoundary>
				<ToastProvider>
					<ClientProvider>{children}</ClientProvider>
				</ToastProvider>
			</ErrorBoundary>
		</NextThemesProvider>
	);
}
