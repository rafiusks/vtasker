import { useDrop } from "react-dnd";
import type { Task } from "../../types/task";
import { TaskCard } from "./TaskCard";
import { LoadingSpinner } from "../common/LoadingSpinner";
import type { TaskStatusUI } from "../../types/typeReference";

interface TaskColumnProps {
	status: TaskStatusUI;
	tasks: Task[];
	onDrop: (taskId: string, newStatusId: number, newIndex?: number) => void;
	onEdit: (taskId: string) => void;
	onDelete: (taskId: string) => void;
	isLoading?: boolean;
	updatingTaskId?: string;
}

export const TaskColumn = ({
	status,
	tasks,
	onDrop,
	onEdit,
	onDelete,
	isLoading = false,
	updatingTaskId,
}: TaskColumnProps) => {
	const [{ isOver }, drop] = useDrop({
		accept: "task",
		drop: (item: { id: string }) => {
			onDrop(item.id, status.id);
		},
		collect: (monitor) => ({
			isOver: monitor.isOver(),
		}),
	});

	return (
		<div
			ref={drop}
			className={`bg-white rounded-lg shadow p-4 ${
				isOver ? "ring-2 ring-blue-500" : ""
			}`}
			data-testid={`task-column-${status.code}`}
		>
			<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
				<span
					className={`w-3 h-3 rounded-full ${status.color}`}
					aria-hidden="true"
				/>
				{status.name}
				<span className="text-sm font-normal text-gray-500">
					({tasks.length})
				</span>
			</h3>

			<div className="space-y-3">
				{isLoading ? (
					<div className="flex justify-center py-4">
						<LoadingSpinner />
					</div>
				) : tasks.length === 0 ? (
					<p className="text-center text-gray-500 py-4">No tasks</p>
				) : (
					tasks.map((task) => (
						<TaskCard
							key={task.id}
							task={task}
							onEdit={() => onEdit(task.id)}
							onDelete={() => onDelete(task.id)}
							isUpdating={updatingTaskId === task.id}
						/>
					))
				)}
			</div>
		</div>
	);
};
