"use client";

import { Header } from "@/components/layout/Header";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ProtectedRoute>
			<Header />
			<main className="container mx-auto p-4">{children}</main>
		</ProtectedRoute>
	);
}
