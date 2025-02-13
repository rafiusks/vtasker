import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 1,
	workers: process.env.CI ? 1 : undefined, // undefined means use number of CPU cores
	reporter: [
		["html"],
		["list"]
	],
	globalSetup: "./e2e/setup/global-setup.ts",
	use: {
		baseURL: "http://localhost:3000",
		trace: "retain-on-failure",
		// Collect traces for failed tests
		video: "retain-on-failure",
		screenshot: "only-on-failure",
		actionTimeout: 30000,
		navigationTimeout: 30000,
		// Add viewport size
		viewport: { width: 1280, height: 720 },
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
			testMatch: /.*\.spec\.ts/,
		},
	],
	// Maximum time one test can run
	timeout: 120000,
	// Maximum time for global setup
	globalTimeout: 600000,
	// Maximum time expect() should wait for the condition to be met
	expect: {
		timeout: 30000,
	},
});
