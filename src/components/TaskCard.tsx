import { useState } from "react";
import { useDrag } from "react-dnd";
import { TaskForm } from "./TaskForm";
import type { Task } from "../types";
import { toast } from "react-hot-toast";

interface TaskCardProps {
	task: {
		id: string;
		title: string;
		status: Task["status"];
		priority: Task["priority"];
		type: Task["type"];
		order: number;
		metadata?: {
			board?: string;
			column?: string;
		};
		progress?: {
			acceptance_criteria: {
				total: number;
				completed: number;
			};
			percentage: number;
		};
		relationships?: {
			labels?: string[];
			dependencies?: string[];
		};
	};
	index: number;
	onEdit?: (task: Task) => void;
	onDelete?: (taskId: string) => void;
	allTasks?: Task[];
}

export function TaskCard({
	task,
	index,
	onEdit,
	onDelete,
	allTasks,
}: TaskCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [taskDetails, setTaskDetails] = useState<Task | null>(null);

	const [{ isDragging }, dragRef] = useDrag({
		type: "TASK",
		item: { id: task.id, status: task.status, index, type: "TASK" },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	const handleOpenTask = async () => {
		if (!task.id) return;

		setIsLoading(true);
		try {
			const response = await fetch(
				`http://localhost:8000/api/v1/tasks/${task.id}`,
			);
			if (!response.ok) {
				throw new Error("Failed to fetch task details");
			}
			const details = await response.json();

			// Ensure we have all required fields
			const fullTask = {
				...task,
				...details,
				content: {
					...details.content,
					acceptance_criteria: details.content?.acceptance_criteria ?? [],
				},
			};

			setTaskDetails(fullTask);
			setIsEditing(true);
		} catch (error) {
			console.error("Error fetching task details:", error);
			toast.error("Failed to load task details");
		} finally {
			setIsLoading(false);
		}
	};

	// Only calculate progress if we have valid metrics
	const progress = task.progress?.percentage ?? 0;

	return (
		<>
			<button
				ref={dragRef}
				type="button"
				className={`w-full text-left p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-move ${
					isLoading ? "opacity-50" : ""
				} ${isDragging ? "opacity-25" : ""}`}
				onClick={isDragging ? undefined : handleOpenTask}
				disabled={isLoading || isDragging}
				data-testid="task-card"
			>
				<div className="flex flex-col gap-2">
					<div className="flex items-start justify-between">
						<h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
						<span
							className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
								task.priority === "high"
									? "bg-red-100 text-red-700"
									: task.priority === "low"
										? "bg-green-100 text-green-700"
										: "bg-blue-100 text-blue-700"
							}`}
						>
							{task.priority}
						</span>
					</div>
					<span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 w-fit">
						{task.id}
					</span>

					{/* Progress Bar */}
					{task.progress && task.progress.acceptance_criteria.total > 0 && (
						<div className="mt-2">
							<div className="flex items-center justify-between text-xs text-gray-500">
								<span>
									{task.progress.acceptance_criteria.completed} of{" "}
									{task.progress.acceptance_criteria.total} criteria
								</span>
								<span>{task.progress.percentage}%</span>
							</div>
							<div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
								<div
									className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
									style={{ width: `${progress}%` }}
								/>
							</div>
						</div>
					)}

					{/* Labels */}
					{(() => {
						const labels = task.relationships?.labels ?? [];
						return labels.length > 0 ? (
							<div className="mt-2 flex flex-wrap gap-1">
								{labels.map((label) => (
									<span
										key={label}
										className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
									>
										{label}
									</span>
								))}
							</div>
						) : null;
					})()}

					{/* Dependencies */}
					{(() => {
						const dependencies = task.relationships?.dependencies ?? [];
						return dependencies.length > 0 ? (
							<div className="mt-2 text-xs text-gray-500">
								Depends on: {dependencies.join(", ")}
							</div>
						) : null;
					})()}
				</div>
			</button>

			{isEditing && taskDetails && (
				<TaskForm
					isOpen={isEditing}
					onClose={() => {
						setIsEditing(false);
						setTaskDetails(null);
					}}
					onSubmit={(updatedTask) => {
						if (onEdit) {
							onEdit(updatedTask as Task);
						}
						setIsEditing(false);
						setTaskDetails(null);
					}}
					task={taskDetails}
					allTasks={allTasks}
				/>
			)}
		</>
	);
}
