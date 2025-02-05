"use client";

import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<button
			type="button"
			className="rounded-md p-2 hover:bg-muted"
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
		>
			{theme === "dark" ? (
				<SunIcon className="h-5 w-5" aria-hidden="true" />
			) : (
				<MoonIcon className="h-5 w-5" aria-hidden="true" />
			)}
		</button>
	);
}
