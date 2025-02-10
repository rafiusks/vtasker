import { useState } from "react";
import type { Task } from "../types";

interface TaskRelationshipsProps {
	task: Task;
	allTasks: Task[];
	onUpdate: (updates: Partial<Task>) => void;
}

interface RelatedTask {
	id: string;
	title: string;
	type: "parent" | "child" | "dependency" | "dependent";
}

export function TaskRelationships({
	task,
	allTasks,
	onUpdate,
}: TaskRelationshipsProps) {
	const [selectedTaskId, setSelectedTaskId] = useState("");

	// Get all related tasks
	const relatedTasks: RelatedTask[] = [];

	// Add parent if exists
	if (task.relationships?.parent) {
		const parentTask = allTasks.find((t) => t.id === task.relationships.parent);
		if (parentTask) {
			relatedTasks.push({
				id: parentTask.id,
				title: parentTask.title,
				type: "parent",
			});
		}
	}

	// Add children
	const childTasks = allTasks.filter(
		(t) => t.relationships?.parent === task.id,
	);
	relatedTasks.push(
		...childTasks.map((t) => ({
			id: t.id,
			title: t.title,
			type: "child" as const,
		})),
	);

	// Add dependencies
	const availableTasks = allTasks.filter(
		(t) =>
			t.id !== task.id && !task.relationships?.dependencies?.includes(t.id),
	);

	const handleAddDependency = () => {
		if (!selectedTaskId) return;

		const currentDependencies = task.relationships?.dependencies || [];
		onUpdate({
			relationships: {
				...task.relationships,
				dependencies: [...currentDependencies, selectedTaskId],
			},
		});
		setSelectedTaskId("");
	};

	const handleRemoveDependency = (dependencyId: string) => {
		const currentDependencies = task.relationships?.dependencies || [];
		onUpdate({
			relationships: {
				...task.relationships,
				dependencies: currentDependencies.filter((id) => id !== dependencyId),
			},
		});
	};

	if (relatedTasks.length === 0) {
		return <div className="text-sm text-gray-500 italic">No relationships</div>;
	}

	return (
		<div className="space-y-4">
			<h3 className="text-sm font-medium text-gray-900">Dependencies</h3>

			{/* Current Dependencies */}
			<div className="space-y-2">
				{(task.relationships?.dependencies || []).map((dependencyId) => {
					const dependencyTask = allTasks.find((t) => t.id === dependencyId);
					return (
						<div
							key={dependencyId}
							className="flex items-center justify-between"
						>
							<span className="text-sm text-gray-600">
								{dependencyTask?.title || "Unknown Task"}
							</span>
							<button
								type="button"
								onClick={() => handleRemoveDependency(dependencyId)}
								className="text-sm text-red-600 hover:text-red-800"
							>
								Remove
							</button>
						</div>
					);
				})}
			</div>

			{/* Add Dependency */}
			<div className="flex gap-2">
				<select
					value={selectedTaskId}
					onChange={(e) => setSelectedTaskId(e.target.value)}
					className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
				>
					<option value="">Select a task...</option>
					{availableTasks.map((t) => (
						<option key={t.id} value={t.id}>
							{t.title}
						</option>
					))}
				</select>
				<button
					type="button"
					onClick={handleAddDependency}
					disabled={!selectedTaskId}
					className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
				>
					Add
				</button>
			</div>
		</div>
	);
}
