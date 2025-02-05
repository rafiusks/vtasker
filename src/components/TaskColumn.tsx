import type { FC } from "react";
import { useDrop } from "react-dnd";
import type { Task } from "../types";
import type { TaskStatusId } from "../types/typeReference";
import type { TASK_STATUS } from "../types/typeReference";
import { TaskCard } from "./TaskCard";

interface TaskColumnProps {
	status: (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
	tasks: Task[];
	onDrop: (taskId: string, statusId: TaskStatusId, order: number) => void;
	onEdit: (taskId: string, updates: Partial<Task>) => void;
	onDelete: (taskId: string) => void;
	onTaskClick: (task: Task) => void;
}

export const TaskColumn: FC<TaskColumnProps> = ({
	status,
	tasks,
	onDrop,
	onEdit,
	onDelete,
	onTaskClick,
}) => {
	const [{ isOver }, drop] = useDrop({
		accept: "task",
		drop: (item: { id: string }, monitor) => {
			const didDrop = monitor.didDrop();
			if (didDrop) {
				return;
			}

			onDrop(item.id, status.id, tasks.length);
		},
		collect: (monitor) => ({
			isOver: monitor.isOver({ shallow: true }),
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
			className={`flex flex-col rounded-lg bg-gray-100 p-4 ${
				isOver ? "ring-2 ring-blue-500" : ""
			}`}
		>
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold text-gray-900">
						{status.label}
					</h2>
					<p className="text-sm text-gray-500">
						{tasks.length} task{tasks.length !== 1 ? "s" : ""}
					</p>
				</div>
			</div>

			<div className="flex-1 space-y-4">
				{tasks.map((task, index) => (
					<TaskCard
						key={task.id}
						task={task}
						index={index}
						onDrop={handleTaskDrop}
						onEdit={handleTaskEdit}
						onDelete={onDelete}
						onTaskClick={onTaskClick}
						allTasks={tasks}
					/>
				))}
			</div>
		</div>
	);
};
