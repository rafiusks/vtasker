"use client";

import { type ReactNode } from "react";
import { QueryProvider } from "@/lib/api/provider";

interface ClientProviderProps {
	children: ReactNode;
}

export function ClientProvider({ children }: ClientProviderProps) {
	return <QueryProvider>{children}</QueryProvider>;
}
