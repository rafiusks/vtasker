import { useDrag } from "react-dnd";
import type { Task } from "../../types";
import { LoadingSpinner } from "../common/LoadingSpinner";

interface TaskCardProps {
	task: Task;
	onClick: () => void;
	isUpdating?: boolean;
}

export const TaskCard = ({
	task,
	onClick,
	isUpdating = false,
}: TaskCardProps) => {
	const [{ isDragging }, drag] = useDrag({
		type: "task",
		item: { id: task.id, title: task.title },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onClick();
		}
	};

	return (
		<button
			ref={drag}
			onClick={onClick}
			onKeyDown={handleKeyDown}
			type="button"
			className={`w-full text-left bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
				isDragging ? "opacity-50" : ""
			}`}
			style={{ cursor: isDragging ? "grabbing" : "pointer" }}
			data-testid={`task-card-${task.id}`}
			aria-label={`Task: ${task.title}`}
		>
			<div className="flex justify-between items-start">
				<h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
				{isUpdating && <LoadingSpinner />}
			</div>
			{task.description && (
				<p className="mt-1 text-sm text-gray-600 line-clamp-2">
					{task.description}
				</p>
			)}
			<div className="mt-2 flex flex-wrap gap-2 text-xs">
				{task.type && (
					<span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-800">
						{task.type.name}
					</span>
				)}
				{task.status && (
					<span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
						{task.status.name}
					</span>
				)}
			</div>
		</button>
	);
};
