import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export async function expectToBeOnPage(page: Page, path: string) {
	await expect(page).toHaveURL(new RegExp(`${path}$`));
}

export async function clearInput(page: Page, selector: string) {
	await page.locator(selector).click();
	await page.keyboard.press("Meta+A");
	await page.keyboard.press("Backspace");
}

export async function waitForToast(page: Page, text: string) {
	await expect(page.getByText(text)).toBeVisible({ timeout: 5000 });
}

export function generateTestUser(prefix = "") {
	const timestamp = Date.now();
	return {
		fullName: `Test User ${prefix}${timestamp}`,
		email: `test${prefix}${timestamp}@example.com`,
		password: "Test@123",
	};
}

export const TEST_USER = generateTestUser();

export async function registerTestUser(page: Page, user = generateTestUser()) {
	await page.goto("/register");
	await page.getByLabel("Full Name").fill(user.fullName);
	await page.getByLabel("Email").fill(user.email);
	await page.getByLabel("Password").fill(user.password);
	await page.getByLabel("Confirm Password").fill(user.password);
	await page.getByRole("button", { name: /create account/i }).click();
	await expectToBeOnPage(page, "/login");
	return user;
}

export async function loginTestUser(page: Page, user = TEST_USER) {
	await page.goto("/login");
	await page.getByLabel("Email").fill(user.email);
	await page.getByLabel("Password").fill(user.password);
	await page.getByRole("button", { name: /login/i }).click();
	await expectToBeOnPage(page, "/dashboard");
	return user;
}
