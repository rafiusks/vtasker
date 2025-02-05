import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
	return (
		<div className="container mx-auto py-6">
			<h1 className="text-2xl font-semibold mb-6">Settings</h1>
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Appearance</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Theme</span>
							<ThemeToggle />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
