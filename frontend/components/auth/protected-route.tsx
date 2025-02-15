"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { protectedPaths } from "@/config/routes";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { isAuthenticated, isLoading } = useAuth();

	useEffect(() => {
		// Check if the current path needs protection
		const needsProtection = protectedPaths.some((path) => {
			if (path.endsWith("*")) {
				const basePath = path.slice(0, -1);
				return pathname.startsWith(basePath);
			}
			return path === pathname;
		});

		if (!isLoading && !isAuthenticated && needsProtection) {
			// Redirect to login with return URL
			const returnUrl = encodeURIComponent(pathname);
			router.push(`/login?returnUrl=${returnUrl}`);
		}
	}, [isAuthenticated, isLoading, pathname, router]);

	// Show nothing while checking authentication
	if (isLoading) {
		return null;
	}

	// If the route is protected and user is not authenticated, don't render children
	const isProtectedRoute = protectedPaths.includes(pathname);
	if (isProtectedRoute && !isAuthenticated) {
		return null;
	}

	// Render children if authenticated or route is not protected
	return <>{children}</>;
}
