import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AcceptanceCriteria } from "../../src/components/AcceptanceCriteria";
import type { AcceptanceCriterion } from "../../src/types";

describe("AcceptanceCriteria", () => {
	const mockCriteria: AcceptanceCriterion[] = [
		{
			id: "1",
			description: "First criterion",
			completed: false,
			completed_at: undefined,
			completed_by: undefined,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			order: 0,
		},
		{
			id: "2",
			description: "Second criterion",
			completed: false,
			completed_at: undefined,
			completed_by: undefined,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			order: 1,
		},
	];

	it("renders all criteria with unique keys", () => {
		const { container } = render(
			<AcceptanceCriteria criteria={mockCriteria} onUpdate={vi.fn()} />,
		);

		// Check if all criteria are rendered
		expect(screen.getByText("First criterion")).toBeInTheDocument();
		expect(screen.getByText("Second criterion")).toBeInTheDocument();

		// Verify unique keys
		const listItems = container.querySelectorAll("li");
		const keys = Array.from(listItems).map((li) => li.getAttribute("data-key"));
		expect(keys).toEqual(["1", "2"]);
	});

	it("toggles criteria independently", () => {
		const onUpdate = vi.fn();
		render(<AcceptanceCriteria criteria={mockCriteria} onUpdate={onUpdate} />);

		// Click first checkbox
		const checkboxes = screen.getAllByRole("button");
		fireEvent.click(checkboxes[0]);

		// Verify only first criterion was toggled
		expect(onUpdate).toHaveBeenCalledWith([
			{ ...mockCriteria[0], completed: true, completed_at: expect.any(String) },
			mockCriteria[1],
		]);
	});

	it("displays descriptions correctly", () => {
		render(<AcceptanceCriteria criteria={mockCriteria} onUpdate={vi.fn()} />);

		const descriptions = screen.getAllByText(/criterion$/);
		expect(descriptions).toHaveLength(2);
		expect(descriptions[0]).toHaveTextContent("First criterion");
		expect(descriptions[1]).toHaveTextContent("Second criterion");
	});
});
