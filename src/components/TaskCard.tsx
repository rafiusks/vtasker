import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { TaskForm } from "./TaskForm";
import type { Task, TaskPriorityEntity } from "../types";
import { toast } from "react-hot-toast";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface TaskCardProps {
	task: Task;
	index: number;
	onDrop: (taskId: string, index: number) => void;
	onEdit: (taskId: string) => void;
	onDelete: (taskId: string) => void;
	onTaskClick: (task: Task) => void;
	allTasks: Task[];
}

export const TaskCard: React.FC<TaskCardProps> = ({
	task,
	index,
	onDrop,
	onEdit,
	onDelete,
	onTaskClick,
	allTasks,
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [taskDetails, setTaskDetails] = useState<Task | null>(null);

	const [{ isDragging }, drag] = useDrag({
		type: "task",
		item: { id: task.id },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	const [{ isOver }, drop] = useDrop({
		accept: "task",
		drop: (item: { id: string }, monitor) => {
			const didDrop = monitor.didDrop();
			if (didDrop) {
				return;
			}

			onDrop(item.id, index);
		},
		collect: (monitor) => ({
			isOver: monitor.isOver({ shallow: true }),
		}),
	});

	const handleEdit = () => {
		onEdit(task.id);
	};

	const handleDelete = () => {
		onDelete(task.id);
	};

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

	const getPriorityColor = (priority: TaskPriorityEntity) => {
		switch (priority.code) {
			case "high":
				return "bg-red-100 text-red-800";
			case "normal":
				return "bg-yellow-100 text-yellow-800";
			case "low":
				return "bg-green-100 text-green-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<>
			<div
				ref={(node) => drag(drop(node))}
				className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${
					isDragging ? "opacity-50" : ""
				} ${isOver ? "ring-2 ring-blue-500" : ""} cursor-pointer`}
				onClick={(e) => {
					e.stopPropagation();
					onTaskClick(task);
				}}
			>
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<h3 className="text-base font-medium text-gray-900">
							{task.title}
						</h3>
						<p className="mt-1 text-sm text-gray-500 line-clamp-2">
							{task.description}
						</p>
					</div>
					<div className="ml-4 flex items-center">
						<button
							type="button"
							onClick={handleEdit}
							className="text-gray-400 hover:text-gray-500"
						>
							<PencilIcon className="h-4 w-4" aria-hidden="true" />
						</button>
						<button
							type="button"
							onClick={handleDelete}
							className="ml-2 text-gray-400 hover:text-red-500"
						>
							<TrashIcon className="h-4 w-4" aria-hidden="true" />
						</button>
					</div>
				</div>

				<div className="mt-3 flex items-center gap-2">
					<span
						className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
							task.priority
								? getPriorityColor(task.priority)
								: "bg-gray-100 text-gray-800"
						}`}
					>
						{task.priority?.name || "Unknown"}
					</span>

					<span
						className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
							task.type === "bug"
								? "bg-red-100 text-red-800"
								: task.type === "feature"
									? "bg-blue-100 text-blue-800"
									: task.type === "docs"
										? "bg-purple-100 text-purple-800"
										: "bg-gray-100 text-gray-800"
						}`}
					>
						{task.type}
					</span>

					{task.content?.due_date && (
						<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
							📅 {new Date(task.content.due_date).toLocaleDateString()}
						</span>
					)}

					{task.content?.assignee && (
						<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
							👤 {task.content.assignee}
						</span>
					)}
				</div>

				{task.content?.acceptance_criteria &&
					task.content.acceptance_criteria.length > 0 && (
						<div className="mt-3">
							<div className="flex items-center gap-1 text-sm text-gray-500">
								<CheckCircleIcon
									className={`h-4 w-4 ${
										task.progress.acceptance_criteria.completed ===
										task.progress.acceptance_criteria.total
											? "text-green-500"
											: "text-gray-400"
									}`}
								/>
								{task.progress.acceptance_criteria.completed}/
								{task.progress.acceptance_criteria.total} criteria
							</div>
						</div>
					)}
			</div>

			{isEditing && taskDetails && (
				<TaskForm
					isOpen={isEditing}
					onClose={() => {
						setIsEditing(false);
						setTaskDetails(null);
					}}
					onSubmit={(updatedTask) => {
						if (onEdit) {
							onEdit(updatedTask.id);
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
};
