import type { FullConfig } from "@playwright/test";
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";

async function globalSetup(config: FullConfig) {
	const { baseURL } = config.projects[0].use;

	// Start the frontend server
	const frontendServer = spawn("pnpm", ["run", "dev"], {
		stdio: "inherit",
		shell: true,
	});

	// Ensure cleanup on process exit
	process.on('exit', () => {
		frontendServer.kill();
	});

	// Wait for the server to be ready
	const browser = await chromium.launch();
	const page = await browser.newPage();

	let retries = 0;
	const maxRetries = 30; // 30 seconds timeout

	while (retries < maxRetries) {
		try {
			if (baseURL) {
				await page.goto(baseURL);
				console.log("Frontend server is ready!");
				await browser.close();
				return;
			}
			throw new Error("baseURL is not defined in the config");
		} catch (error) {
			retries++;
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}

	throw new Error("Frontend server failed to start");
}

export default globalSetup;
