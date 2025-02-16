import React from "react";
import type { Preview } from "@storybook/react";
import { ThemeProvider } from "next-themes";
import "../app/globals.css";

const preview: Preview = {
	parameters: {
		actions: { argTypesRegex: "^on[A-Z].*" },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		nextjs: {
			appDirectory: true,
		},
		themes: {
			default: "light",
			list: [
				{ name: "light", class: "light", color: "#ffffff" },
				{ name: "dark", class: "dark", color: "#0f172a" },
			],
		},
	},
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<div className="min-h-screen">
					<Story />
				</div>
			</ThemeProvider>
		),
	],
};

export default preview;
