import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { AuthDebugMenu } from "@/components/debug/auth-debug-menu";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "vTasker - Modern Task Management",
	description: "A powerful task management system for teams",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			data-new-gr-c-s-check-loaded="14.1093.0"
			data-gr-ext-installed=""
		>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				suppressHydrationWarning
			>
				<Providers>
					{children}
					<AuthDebugMenu />
				</Providers>
			</body>
		</html>
	);
}
