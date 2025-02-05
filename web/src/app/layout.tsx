import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "VTasker - Service Management",
	description: "Modern service management platform for Kubernetes",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<Providers>
					<div className="min-h-screen">
						<Navbar />
						<div className="flex">
							<Sidebar />
							<main className="flex-1 p-4">{children}</main>
						</div>
					</div>
				</Providers>
			</body>
		</html>
	);
}
