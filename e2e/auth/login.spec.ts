import { test, expect } from "@playwright/test";
import {
	generateTestUser,
	expectToBeOnPage,
	waitForToast,
	registerTestUser,
} from "../test-utils";

test.describe("User Login", () => {
	test.beforeEach(async ({ page }) => {
		// Go to homepage before each test
		await page.goto("/");

		// Listen to console logs
		page.on("console", (msg) => {
			console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
		});
	});

	const navigateToLogin = async (page) => {
		await page.goto("/login");
		await page.waitForLoadState("networkidle");
	};

	test("should successfully login with valid credentials", async ({ page }) => {
		// First register a test user
		const testUser = await registerTestUser(page);

		// Navigate to login page
		await navigateToLogin(page);

		// Verify we're on the login page
		await expectToBeOnPage(page, "/login");

		// Fill in the login form
		await page.getByTestId("email-input").fill(testUser.email);
		await page.getByTestId("password-input").fill(testUser.password);

		// Click login and wait for response
		await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/auth/login") &&
					response.status() === 200,
			),
			page.getByTestId("login-button").click(),
		]);

		// Wait for navigation to dashboard
		await page.waitForURL(/\/dashboard$/, { waitUntil: "networkidle" });

		// Verify we're on the dashboard
		await expectToBeOnPage(page, "/dashboard");
	});

	test("should show validation errors for empty fields", async ({ page }) => {
		// Navigate to login page
		await navigateToLogin(page);

		// Verify validation messages are not visible initially
		await expect(
			page.locator("text=Email is required").first(),
		).not.toBeVisible();
		await expect(
			page.locator("text=Password is required").first(),
		).not.toBeVisible();

		// Focus and blur each field to trigger validation
		await page.getByTestId("email-input").click();
		await page.getByTestId("password-input").click();
		await page.getByTestId("email-input").click();

		// Wait for validation messages
		await expect(page.locator("text=Email is required").first()).toBeVisible();
		await expect(
			page.locator("text=Password is required").first(),
		).toBeVisible();
	});

	test("should show validation error for invalid email format", async ({
		page,
	}) => {
		// Navigate to login page
		await navigateToLogin(page);

		// Fill invalid email and blur
		await page.getByTestId("email-input").fill("invalid-email");
		await page.getByTestId("password-input").click(); // blur email field

		// Wait for validation message
		await expect(
			page.locator("text=Invalid email format").first(),
		).toBeVisible();
	});

	test("should show error message for invalid credentials", async ({
		page,
	}) => {
		const testUser = generateTestUser("invalid");

		// Navigate to login page
		await navigateToLogin(page);

		// Fill in the login form with invalid credentials
		await page.getByTestId("email-input").fill(testUser.email);
		await page.getByTestId("password-input").fill("wrongpassword");

		// Submit form and wait for error response
		await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/auth/login") &&
					response.status() === 401,
			),
			page.getByTestId("login-button").click(),
		]);

		// Wait for error message
		await expect(
			page.locator("text=Invalid credentials").first(),
		).toBeVisible();

		// Verify we're still on the login page
		await expectToBeOnPage(page, "/login");
	});

	test("should preserve form state after validation errors", async ({
		page,
	}) => {
		// Navigate to login page
		await navigateToLogin(page);

		// Fill in the form
		const testEmail = "test@example.com";
		await page.getByTestId("email-input").fill(testEmail);
		await page.getByTestId("password-input").fill("short"); // Too short password

		// Trigger validation
		await page.getByTestId("email-input").click();

		// Verify email field still contains the value
		const emailValue = await page.getByTestId("email-input").inputValue();
		expect(emailValue).toBe(testEmail);
	});

	test("should clear error messages when typing", async ({ page }) => {
		// Navigate to login page
		await navigateToLogin(page);

		// Trigger validation errors
		await page.getByTestId("email-input").click();
		await page.getByTestId("password-input").click();
		await page.getByTestId("email-input").click();

		// Wait for error message
		await expect(page.locator("text=Email is required").first()).toBeVisible();

		// Start typing and verify error message disappears
		await page.getByTestId("email-input").fill("t");
		await expect(
			page.locator("text=Email is required").first(),
		).not.toBeVisible();
	});

	test("should handle network errors gracefully", async ({ page }) => {
		// Navigate to login page
		await navigateToLogin(page);

		// Simulate offline mode
		await page.route("**/api/auth/login", (route) => {
			route.abort("failed");
		});

		// Fill in the form
		await page.getByTestId("email-input").fill("test@example.com");
		await page.getByTestId("password-input").fill("password123");

		// Submit form
		await page.getByTestId("login-button").click();

		// Wait for error message
		await expect(page.locator("text=Failed to login").first()).toBeVisible();
	});

	test("should persist session when remember me is checked", async ({
		page,
	}) => {
		// First register a test user
		const testUser = await registerTestUser(page);

		// Navigate to login page
		await navigateToLogin(page);

		// Fill in the login form with remember me
		await page.getByTestId("email-input").fill(testUser.email);
		await page.getByTestId("password-input").fill(testUser.password);
		await page.getByLabel(/remember me/i).check();

		// Login and wait for response
		await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/auth/login") &&
					response.status() === 200,
			),
			page.getByTestId("login-button").click(),
		]);

		// Wait for navigation to dashboard
		await page.waitForURL(/\/dashboard$/, { waitUntil: "networkidle" });

		// Store current cookies and local storage
		const hasAuthInLocalStorage = await page.evaluate(() => {
			return window.localStorage.getItem("auth") !== null;
		});
		const hasAuthInSessionStorage = await page.evaluate(() => {
			return window.sessionStorage.getItem("auth") !== null;
		});

		// Verify auth data is stored in localStorage when remember me is checked
		expect(hasAuthInLocalStorage).toBeTruthy();
		expect(hasAuthInSessionStorage).toBeFalsy();
	});

	test("should handle token refresh and session management", async ({
		page,
	}) => {
		// First register a test user
		const testUser = await registerTestUser(page);

		// Navigate to login page
		await navigateToLogin(page);

		// Fill in the login form
		await page.getByTestId("email-input").fill(testUser.email);
		await page.getByTestId("password-input").fill(testUser.password);

		// Login and wait for response
		const [response] = await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/auth/login") &&
					response.status() === 200,
			),
			page.getByTestId("login-button").click(),
		]);

		// Get the initial token
		const loginData = await response.json();
		const initialToken = loginData.token;

		// Wait for navigation to dashboard
		await page.waitForURL(/\/dashboard$/, { waitUntil: "networkidle" });

		// Wait for a board request to verify token is being used
		const [boardResponse] = await Promise.all([
			page.waitForResponse((response) =>
				response.url().includes("/api/boards"),
			),
			page.reload(),
		]);

		// Verify the Authorization header contains our token
		const authHeader = boardResponse.request().headers().authorization;
		expect(authHeader).toBe(`Bearer ${initialToken}`);

		// Wait for token refresh to be scheduled
		await page.waitForTimeout(1000); // Give time for refresh to be scheduled

		// Verify token refresh is scheduled
		const isRefreshScheduled = await page.evaluate(() => {
			return window.localStorage.getItem("tokenRefreshTimeout") !== null;
		});
		expect(isRefreshScheduled).toBe(true);
	});
});
