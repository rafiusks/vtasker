import "@testing-library/jest-dom";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

// Cleanup after each test case
afterEach(() => {
	cleanup();
});

// Extend the expect interface with jest-dom matchers
declare global {
	namespace Vi {
		interface JestAssertion<T = unknown> {
			toBeInTheDocument(): void;
			toHaveTextContent(text: string): void;
		}
	}
}
