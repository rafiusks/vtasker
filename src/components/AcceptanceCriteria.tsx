import { useState, useEffect } from "react";
import type { AcceptanceCriterion } from "../types";
import { CheckIcon, PlusIcon } from "@heroicons/react/24/outline";

interface AcceptanceCriteriaProps {
	criteria?: AcceptanceCriterion[];
	onUpdate: (criteria: AcceptanceCriterion[]) => void;
	readonly?: boolean;
	taskId?: string;
}

export function AcceptanceCriteria({
	criteria,
	onUpdate,
	readonly = false,
	taskId,
}: AcceptanceCriteriaProps) {
	const safeCriteria = criteria || [];
	const [newCriterion, setNewCriterion] = useState("");
	const [showError, setShowError] = useState(false);

	// Ensure criteria have descriptions and order
	useEffect(() => {
		const updatedCriteria = safeCriteria
			.filter((c) => c && typeof c === "object")
			.map((c, index) => {
				const description =
					typeof c.description === "string" ? c.description.trim() : "";
				if (!description) {
					console.warn("Empty description found for criterion:", c.id);
					return null;
				}
				return {
					...c,
					description,
					order: typeof c.order === "number" ? c.order : index,
				};
			})
			.filter((c): c is AcceptanceCriterion => c !== null);

		if (JSON.stringify(updatedCriteria) !== JSON.stringify(safeCriteria)) {
			onUpdate(updatedCriteria);
		}
	}, [safeCriteria, onUpdate]);

	const handleToggle = async (criterion: AcceptanceCriterion) => {
		if (readonly) return;

		const now = new Date().toISOString();
		const updated = safeCriteria.map((c) => {
			if (c.id === criterion.id) {
				const updatedCriterion = {
					...c,
					completed: !c.completed,
					completed_at: !c.completed ? now : null,
					completed_by: !c.completed ? "user" : null,
					updated_at: now,
				};
				console.log(
					"Toggling criterion:",
					JSON.stringify(updatedCriterion, null, 2),
				);
				return updatedCriterion;
			}
			return c;
		});

		// Update locally first for immediate feedback
		onUpdate(updated);

		// Then update on the server
		try {
			if (!taskId) {
				console.error("No task ID provided");
				return;
			}

			const response = await fetch(
				`http://localhost:8000/api/tasks/${taskId}/acceptance-criteria`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ criteria: updated }),
				},
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				throw new Error(
					`Failed to update acceptance criteria: ${errorData?.error || response.statusText}`,
				);
			}

			const updatedTask = await response.json();
			console.log("Server response:", updatedTask);
		} catch (error) {
			console.error("Error updating acceptance criteria:", error);
			// Revert the local update if server update fails
			onUpdate(safeCriteria);
		}
	};

	const handleAdd = (e?: React.FormEvent) => {
		if (e) {
			e.preventDefault();
		}
		const description = newCriterion.trim();
		if (!description) {
			setShowError(true);
			return;
		}
		setShowError(false);

		const now = new Date().toISOString();
		const criterion: AcceptanceCriterion = {
			id: crypto.randomUUID(),
			description: description,
			completed: false,
			completed_at: null,
			completed_by: null,
			created_at: now,
			updated_at: now,
			order: safeCriteria.length,
		};

		console.log("Adding new criterion:", JSON.stringify(criterion, null, 2));
		onUpdate([...safeCriteria, criterion]);
		setNewCriterion("");
	};

	const handleDelete = (id: string) => {
		const filtered = safeCriteria.filter((c) => c.id !== id);
		onUpdate(filtered);
	};

	const completedCount = safeCriteria.filter((c) => c.completed).length;
	const progress =
		safeCriteria.length > 0
			? Math.round((completedCount / safeCriteria.length) * 100)
			: 0;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-medium text-gray-900">
					Acceptance Criteria
				</h3>
				<span
					className="text-sm text-gray-500"
					data-testid="criteria-progress-text"
				>
					{completedCount} of {safeCriteria.length} completed ({progress}%)
				</span>
			</div>

			{/* Progress Bar */}
			<div
				className="w-full bg-gray-200 rounded-full h-2.5"
				data-testid="criteria-progress-container"
			>
				<div
					className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
					style={{ width: `${progress}%` }}
					data-testid="criteria-progress"
					aria-valuenow={progress}
					aria-valuemin={0}
					aria-valuemax={100}
				/>
			</div>

			{/* Criteria List */}
			<ul className="space-y-2">
				{safeCriteria.map((criterion) => {
					if (!criterion.description) {
						console.warn(
							"Empty description found for criterion:",
							criterion.id,
						);
					}
					return (
						<li
							key={criterion.id}
							data-key={criterion.id}
							data-testid="acceptance-criterion"
							className="flex items-start gap-2 group"
						>
							<button
								type="button"
								onClick={() => handleToggle(criterion)}
								disabled={readonly}
								className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border flex items-center justify-center cursor-pointer ${
									criterion.completed
										? "bg-blue-600 border-blue-600 text-white hover:bg-blue-500"
										: "border-gray-300 bg-white hover:border-blue-500"
								}`}
								data-testid="acceptance-criterion-checkbox"
							>
								{criterion.completed && <CheckIcon className="w-4 h-4" />}
							</button>
							<span
								className={`text-sm ${criterion.completed ? "text-gray-500 line-through" : "text-gray-900"}`}
								data-testid="acceptance-criterion-description"
							>
								{criterion.description}
							</span>
						</li>
					);
				})}
			</ul>

			{/* Add New Criterion */}
			{!readonly && (
				<div className="space-y-2">
					<div className="flex gap-2">
						<div className="relative flex-grow">
							<input
								type="text"
								value={newCriterion}
								onChange={(e) => {
									setNewCriterion(e.target.value);
									if (showError) setShowError(false);
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleAdd();
									}
								}}
								placeholder="Add acceptance criterion..."
								className={`block w-full rounded-md border-0 py-1.5 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ${
									showError ? "ring-red-500" : "ring-gray-300"
								} placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
								aria-invalid={showError}
								aria-errormessage={showError ? "criterion-error" : undefined}
							/>
							{showError && (
								<p id="criterion-error" className="mt-1 text-xs text-red-500">
									Description is required
								</p>
							)}
						</div>
						<button
							type="button"
							onClick={() => handleAdd()}
							className="rounded-md bg-blue-600 p-2 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
						>
							<PlusIcon className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
