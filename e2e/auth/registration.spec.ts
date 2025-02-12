import { test, expect } from "@playwright/test";
import {
	generateTestUser,
	expectToBeOnPage,
	waitForToast,
} from "../test-utils";

test.describe("User Registration", () => {
	test.beforeEach(async ({ page }) => {
		// Go to homepage before each test
		await page.goto("/");

		// Listen to console logs
		page.on("console", (msg) => {
			console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
		});
	});

	test("should successfully register a new user", async ({ page }) => {
		const testUser = generateTestUser("success");

		// Click on register link
		await page.getByRole("link", { name: /register/i }).click();

		// Verify we're on the registration page
		await expectToBeOnPage(page, "/register");

		// Fill in the registration form
		await page.getByTestId("fullname-input").fill(testUser.fullName);
		await page.getByTestId("email-input").fill(testUser.email);
		await page.getByTestId("password-input").fill(testUser.password);
		await page.getByTestId("confirm-password-input").fill(testUser.password);

		// Wait for response and click
		const [response] = await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/auth/register") &&
					response.status() === 201,
			),
			page.getByTestId("register-button").click(),
		]);

		// Log response for debugging
		console.log("Registration response:", await response.json());

		// Wait for navigation
		await page.waitForURL(/\/login$/, { waitUntil: "networkidle" });

		// Verify success message
		await waitForToast(page, "Account created successfully");
	});

	test("should show validation errors for empty fields", async ({ page }) => {
		// Navigate to register page
		await page.getByRole("link", { name: /register/i }).click();

		// Verify validation messages are not visible initially
		await expect(page.getByText(/full name is required/i)).not.toBeVisible();
		await expect(page.getByText(/email is required/i)).not.toBeVisible();
		await expect(page.getByText(/password is required/i)).not.toBeVisible();

		// Focus and blur each field to trigger validation
		await page.getByTestId("fullname-input").click();
		await page.getByTestId("email-input").click();
		await page.getByTestId("password-input").click();
		await page.getByTestId("confirm-password-input").click();
		await page.getByTestId("fullname-input").click();

		// Verify validation messages
		await expect(page.getByText(/full name is required/i)).toBeVisible();
		await expect(page.getByText(/email is required/i)).toBeVisible();
		await expect(page.getByText(/password is required/i)).toBeVisible();
	});

	test("should show validation error for invalid email", async ({ page }) => {
		// Navigate to register page
		await page.getByRole("link", { name: /register/i }).click();

		// Fill invalid email
		await page.getByTestId("email-input").fill("invalid-email");
		await page.getByTestId("fullname-input").click(); // blur email field

		// Verify validation message
		await expect(page.getByText(/invalid email format/i)).toBeVisible();
	});

	test("should show validation error for mismatched passwords", async ({
		page,
	}) => {
		// Navigate to register page
		await page.getByRole("link", { name: /register/i }).click();

		// Fill mismatched passwords
		await page.getByTestId("password-input").fill("Test@123");
		await page.getByTestId("confirm-password-input").fill("different-password");
		await page.getByTestId("fullname-input").click(); // blur password field

		// Verify validation message
		await expect(page.getByText(/passwords do not match/i)).toBeVisible();
	});

	test("should prevent registration with existing email", async ({ page }) => {
		const testUser = generateTestUser("duplicate");

		// First register a user
		await page.goto("/register");
		await page.getByTestId("fullname-input").fill(testUser.fullName);
		await page.getByTestId("email-input").fill(testUser.email);
		await page.getByTestId("password-input").fill(testUser.password);
		await page.getByTestId("confirm-password-input").fill(testUser.password);

		// Wait for first registration response and click
		const [response] = await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/auth/register") &&
					response.status() === 201,
			),
			page.getByTestId("register-button").click(),
		]);

		// Log response for debugging
		console.log("First registration response:", await response.json());

		// Wait for navigation
		await page.waitForURL(/\/login$/, { waitUntil: "networkidle" });
		await waitForToast(page, "Account created successfully");

		// Try to register again with same email
		await page.goto("/register");
		await page.getByTestId("fullname-input").fill("Another User");
		await page.getByTestId("email-input").fill(testUser.email);
		await page.getByTestId("password-input").fill("AnotherPass123!");
		await page.getByTestId("confirm-password-input").fill("AnotherPass123!");

		// Submit second registration and wait for error response
		const [errorResponse] = await Promise.all([
			page.waitForResponse(
				(response) =>
					response.url().includes("/api/auth/register") &&
					response.status() === 409,
			),
			page.getByTestId("register-button").click(),
		]);

		// Log error response for debugging
		const errorData = await errorResponse.json();
		console.log("Error response:", errorData);

		// Wait for error message to be visible
		await expect(page.getByText("User already exists")).toBeVisible();

		// Verify we're still on the register page
		await expect(page).toHaveURL(/\/register$/);
	});
});
