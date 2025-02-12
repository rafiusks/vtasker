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
	await page.getByTestId("fullname-input").fill(user.fullName);
	await page.getByTestId("email-input").fill(user.email);
	await page.getByTestId("password-input").fill(user.password);
	await page.getByTestId("confirm-password-input").fill(user.password);
	await page.getByTestId("register-button").click();
	await expectToBeOnPage(page, "/login");
	return user;
}

export async function loginTestUser(page: Page, user = TEST_USER) {
	await page.goto("/login");
	await page.getByTestId("email-input").fill(user.email);
	await page.getByTestId("password-input").fill(user.password);
	await page.getByTestId("login-button").click();
	await expectToBeOnPage(page, "/dashboard");
	return user;
}
