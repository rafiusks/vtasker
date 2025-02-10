import type { FC } from "react";
import { useDrop } from "react-dnd";
import type { Task } from "../types";
import type { TaskStatusId } from "../types/typeReference";
import type { TASK_STATUS } from "../types/typeReference";
import { TaskCard } from "./TaskCard";
import type { TaskStatusUIType } from "../types/typeReference";

interface TaskColumnProps {
	status: TaskStatusUIType;
	tasks: Task[];
	onDrop: (taskId: string, statusId: number, index: number) => void;
	onEdit: (task: Task) => void;
	onDelete: (taskId: string) => void;
	onTaskClick: (task: Task) => void;
	isLoading?: boolean;
	updatingTaskId?: string;
}

export const TaskColumn: FC<TaskColumnProps> = ({
	status,
	tasks,
	onDrop,
	onEdit,
	onDelete,
	onTaskClick,
	isLoading = false,
	updatingTaskId,
}) => {
	const [{ isOver }, drop] = useDrop({
		accept: "task",
		drop: (item: { id: string }, monitor) => {
			const dropIndex = tasks.length;
			onDrop(item.id, status.id, dropIndex);
		},
		collect: (monitor) => ({
			isOver: monitor.isOver(),
		}),
	});

	const handleTaskDrop = (taskId: string, index: number) => {
		onDrop(taskId, status.id, index);
	};

	const handleTaskEdit = (taskId: string) => {
		const task = tasks.find((t) => t.id === taskId);
		if (task) {
			onTaskClick(task);
		}
	};

	return (
		<div
			ref={drop}
			className={`bg-gray-50 p-4 rounded-lg ${
				isOver ? "border-2 border-blue-500" : ""
			}`}
			data-testid={status.columnId}
		>
			<h2 className="text-lg font-medium text-gray-900 mb-4">{status.label}</h2>
			<div className="space-y-4">
				{tasks.map((task, index) => (
					<TaskCard
						key={task.id}
						task={task}
						index={index}
						onDrop={(taskId) => onDrop(taskId, status.id, index)}
						onEdit={() => onEdit(task)}
						onDelete={onDelete}
						onTaskClick={onTaskClick}
						allTasks={tasks}
						isLoading={isLoading || task.id === updatingTaskId}
					/>
				))}
			</div>
		</div>
	);
};
