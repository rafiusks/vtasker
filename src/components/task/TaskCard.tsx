import { useDrag } from "react-dnd";
import type { Task } from "../../types";
import { LoadingSpinner } from "../common/LoadingSpinner";

interface TaskCardProps {
	task: Task;
	onEdit: () => void;
	onDelete: () => void;
	isUpdating?: boolean;
}

export const TaskCard = ({
	task,
	onEdit,
	onDelete,
	isUpdating = false,
}: TaskCardProps) => {
	const [{ isDragging }, drag] = useDrag({
		type: "task",
		item: { id: task.id, title: task.title },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	return (
		<article
			ref={drag}
			className={`bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow ${
				isDragging ? "opacity-50" : ""
			}`}
			style={{ cursor: isDragging ? "grabbing" : "grab" }}
			data-testid={`task-card-${task.id}`}
			aria-label={`Task: ${task.title}`}
		>
			<div className="flex justify-between items-start">
				<h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
				<div className="flex items-center space-x-2">
					{isUpdating ? (
						<LoadingSpinner />
					) : (
						<>
							<button
								type="button"
								onClick={onEdit}
								className="text-gray-400 hover:text-gray-600 p-1"
								data-testid="edit-task-button"
								aria-label={`Edit task: ${task.title}`}
							>
								<span className="sr-only">Edit task</span>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
								>
									<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
								</svg>
							</button>
							<button
								type="button"
								onClick={onDelete}
								className="text-red-400 hover:text-red-600 p-1"
								data-testid="delete-task-button"
								aria-label={`Delete task: ${task.title}`}
							>
								<span className="sr-only">Delete task</span>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4"
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
						</>
					)}
				</div>
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
		</article>
	);
};
