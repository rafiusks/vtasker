import React, { useState } from "react";
import { useDrop } from "react-dnd";
import type { Task, TaskStatus } from "../types";
import { TaskCard } from "./TaskCard";

interface TaskColumnProps {
	status: TaskStatus;
	tasks: Task[];
	onDrop: (taskId: string, statusId: number, order: number) => void;
	onEdit: (taskId: string) => void;
	onDelete: (taskId: string) => void;
	onTaskClick: (task: Task) => void;
	allTasks: Task[];
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
	status,
	tasks,
	onDrop,
	onEdit,
	onDelete,
	onTaskClick,
	allTasks,
}) => {
	const [{ isOver }, drop] = useDrop({
		accept: "task",
		drop: (item: { id: string }, monitor) => {
			const didDrop = monitor.didDrop();
			if (didDrop) {
				return;
			}

			// When dropping at the end of a column, use the current length as the order
			const order = tasks.length;
			console.log("Dropping at end of column:", {
				taskId: item.id,
				statusId: status.id,
				order,
				tasksInColumn: tasks.length,
			});
			onDrop(item.id, status.id, order);
		},
		collect: (monitor) => ({
			isOver: monitor.isOver({ shallow: true }),
		}),
	});

	const handleTaskDrop = (taskId: string, index: number) => {
		// When dropping on a task, use its index as the order
		console.log("Dropping on task:", {
			taskId,
			statusId: status.id,
			index,
			tasksInColumn: tasks.length,
		});
		onDrop(taskId, status.id, index);
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
					<h2 className="text-lg font-semibold text-gray-900">{status.name}</h2>
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
						onEdit={onEdit}
						onDelete={onDelete}
						onTaskClick={onTaskClick}
						allTasks={allTasks}
					/>
				))}
			</div>
		</div>
	);
};
