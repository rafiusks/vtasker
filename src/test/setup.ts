import { afterEach } from "vitest";

// Cleanup after each test case
afterEach(() => {
	// Add any cleanup code here if needed
});

// Extend the expect interface with Playwright matchers
declare module "@playwright/test" {
	export interface Matchers<R> {
		toBeVisible(): R;
		toHaveText(text: string): R;
		toHaveCount(count: number): R;
		toHaveAttribute(name: string, value: string): R;
		toHaveValue(value: string): R;
	}
}
