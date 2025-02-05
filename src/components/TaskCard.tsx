import type { FC } from "react";
import { useDrag } from "react-dnd";
import type { Task } from "../types";

interface TaskCardProps {
	task: Task;
	index: number;
	onDrop: (taskId: string, index: number) => void;
	onEdit: (taskId: string) => void;
	onDelete: (taskId: string) => void;
	onTaskClick: (task: Task) => void;
	allTasks: Task[];
}

export const TaskCard: FC<TaskCardProps> = ({
	task,
	index,
	onDrop,
	onEdit,
	onDelete,
	onTaskClick,
	allTasks,
}) => {
	const [{ isDragging }, drag] = useDrag({
		type: "task",
		item: { id: task.id },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	const handleEdit = () => {
		onEdit(task.id);
	};

	const handleDelete = () => {
		onDelete(task.id);
	};

	return (
		<div
			ref={drag}
			className={`bg-white rounded-lg shadow p-4 ${
				isDragging ? "opacity-50" : ""
			}`}
			style={{ cursor: "move" }}
			data-testid="task-card"
		>
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
					<p className="mt-1 text-sm text-gray-500 line-clamp-2">
						{task.description}
					</p>
				</div>
				<div className="ml-4 flex-shrink-0">
					<button
						type="button"
						onClick={handleEdit}
						className="text-gray-400 hover:text-gray-500"
					>
						<span className="sr-only">Edit</span>
						<svg
							className="h-5 w-5"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
						</svg>
					</button>
					<button
						type="button"
						onClick={handleDelete}
						className="ml-2 text-gray-400 hover:text-gray-500"
					>
						<span className="sr-only">Delete</span>
						<svg
							className="h-5 w-5"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								fillRule="evenodd"
								d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
								clipRule="evenodd"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
};
