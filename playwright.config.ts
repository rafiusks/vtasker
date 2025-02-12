import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1,
	reporter: "html",
	globalSetup: "./e2e/setup/global-setup.ts",
	use: {
		baseURL: "http://localhost:3000",
		trace: "on-first-retry",
		// Collect traces for failed tests
		video: "retain-on-failure",
		screenshot: "only-on-failure",
		actionTimeout: 15000,
		navigationTimeout: 15000,
		// Add viewport size
		viewport: { width: 1280, height: 720 },
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "e2e",
			use: { ...devices["Desktop Chrome"] },
			testMatch: /.*\.spec\.ts/,
		},
	],
	// Maximum time one test can run
	timeout: 60000,
	// Maximum time for global setup
	globalTimeout: 600000,
	// Maximum time expect() should wait for the condition to be met
	expect: {
		timeout: 10000,
	},
});
