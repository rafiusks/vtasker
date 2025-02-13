import type { FC } from "react";
import { useDrag } from "react-dnd";
import type { Task } from "../types";
import { getTaskPriority, getTaskType } from "../types/typeReference";
import { TrashIcon, PencilIcon } from "@heroicons/react/20/solid";

interface TaskCardProps {
	task: Task;
	onEdit?: (taskId: string) => void;
	onDelete?: (taskId: string) => void;
	isLoading?: boolean;
}

export const TaskCard: FC<TaskCardProps> = ({
	task,
	onEdit,
	onDelete,
	isLoading = false,
}) => {
	const [{ isDragging }, drag] = useDrag({
		type: "task",
		item: { id: task.id },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	const handleEdit = () => {
		onEdit?.(task.id);
	};

	const handleDelete = () => {
		onDelete?.(task.id);
	};

	// Get priority and type information
	const priorityName = getTaskPriority(Number(task.priority_id))?.name || "Normal";
	const typeName = getTaskType(Number(task.type_id))?.name || "Feature";

	return (
		<div
			ref={drag}
			className={`bg-white rounded-lg shadow p-4 ${
				isDragging ? "opacity-50" : ""
			} ${isLoading ? "animate-pulse" : ""}`}
			style={{ cursor: "move" }}
			data-testid="task-card"
			data-loading={isLoading}
		>
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
					<p className="mt-1 text-sm text-gray-500 line-clamp-2">
						{task.description}
					</p>
					<div className="mt-2 flex items-center gap-2">
						<span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
							{priorityName}
						</span>
						<span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
							{typeName}
						</span>
					</div>
				</div>
				<div className="ml-4 flex-shrink-0">
					<button
						type="button"
						onClick={handleEdit}
						className="text-gray-400 hover:text-gray-500"
						disabled={isLoading}
					>
						<span className="sr-only">Edit task</span>
						<PencilIcon className="h-5 w-5" />
					</button>
					<button
						type="button"
						onClick={handleDelete}
						className="ml-2 text-gray-400 hover:text-gray-500"
						disabled={isLoading}
					>
						<span className="sr-only">Delete</span>
						<TrashIcon className="h-5 w-5" />
					</button>
				</div>
			</div>
		</div>
	);
};
