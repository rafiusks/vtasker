import { useDrop } from "react-dnd";
import { TaskCard } from "./TaskCard";
import type { Task, TaskStatus } from "../types/index";
import type { TaskStatusUIType } from "../types/typeReference";

interface TaskColumnProps {
	status: TaskStatusUIType;
	tasks: Task[];
	onDrop: (taskId: string, newStatusId: number, newIndex?: number) => void;
	onEdit: (taskId: string) => void;
	onDelete: (taskId: string) => void;
	isLoading?: boolean;
	updatingTaskId?: string;
}

export function TaskColumn({
	status,
	tasks,
	onDrop,
	onEdit,
	onDelete,
	isLoading = false,
	updatingTaskId,
}: TaskColumnProps) {
	const [{ isOver }, drop] = useDrop({
		accept: "task",
		drop: (item: { id: string }) => {
			const dropIndex = tasks.length;
			onDrop(item.id, status.id, dropIndex);
		},
		collect: (monitor) => ({
			isOver: monitor.isOver(),
		}),
	});

	return (
		<div
			ref={drop}
			className={`bg-gray-50 p-4 rounded-lg ${
				isOver ? "border-2 border-blue-500" : ""
			}`}
			data-testid={`status-column-${status.code}`}
		>
			<h2 className="text-lg font-medium text-gray-900 mb-4">{status.name}</h2>
			<div className="space-y-4">
				{tasks.map((task) => (
					<TaskCard
						key={task.id}
						task={task as Task & { status?: TaskStatus }}
						onEdit={onEdit}
						onDelete={onDelete}
						isLoading={isLoading || task.id === updatingTaskId}
					/>
				))}
			</div>
		</div>
	);
}
