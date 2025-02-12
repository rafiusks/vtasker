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
		item: { id: task.id },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	return (
		<div
			ref={drag}
			className={`bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow ${
				isDragging ? "opacity-50" : ""
			}`}
			style={{ cursor: "grab" }}
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
								className="text-gray-400 hover:text-gray-600"
							>
								Edit
							</button>
							<button
								type="button"
								onClick={onDelete}
								className="text-red-400 hover:text-red-600"
							>
								Delete
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
		</div>
	);
};
