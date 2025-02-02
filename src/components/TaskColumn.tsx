import React, { useState } from "react";
import { useDrop } from "react-dnd";
import type { Task } from "../types";
import { TaskCard } from "./TaskCard";

interface TaskColumnProps {
	status: Task["status"];
	tasks: Task[];
	onDrop: (
		taskId: string,
		newStatus: Task["status"],
		newIndex?: number,
	) => void;
	onEdit?: (task: Task) => void;
	onDelete?: (taskId: string) => void;
	allTasks?: Task[];
}

export function TaskColumn({
	status,
	tasks,
	onDrop,
	onEdit,
	onDelete,
	allTasks = tasks,
}: TaskColumnProps) {
	const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

	const [{ isOver }, dropRef] = useDrop({
		accept: "TASK",
		drop: async (item: {
			id: string;
			status: Task["status"];
			index: number;
			type: "TASK";
		}) => {
			if (item.status !== status) {
				// If moving to a different column, append to the end
				await onDrop(item.id, status, tasks.length);
			} else {
				// If reordering within the same column, use the dragged over index
				const dropIndex =
					draggedOverIndex !== null ? draggedOverIndex : tasks.length;
				await onDrop(item.id, status, dropIndex);
			}
			setDraggedOverIndex(null);
		},
		collect: (monitor) => ({
			isOver: monitor.isOver({ shallow: true }),
		}),
	});

	return (
		<div
			ref={dropRef}
			className={`bg-white rounded-xl shadow-sm border-2 transition-colors ${
				isOver ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-200"
			} p-4`}
			onDragLeave={(e) => {
				// Only reset if we're leaving the column, not entering a child
				if (!e.currentTarget.contains(e.relatedTarget as Node)) {
					setDraggedOverIndex(null);
				}
			}}
		>
			<h2 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
				<span className="w-6 h-6 inline-flex items-center justify-center mr-2 text-base">
					{status === "backlog"
						? "📥"
						: status === "in-progress"
							? "🏃"
							: status === "review"
								? "👀"
								: "✅"}
				</span>
				{status === "backlog"
					? "Backlog"
					: status === "in-progress"
						? "In Progress"
						: status === "review"
							? "Review"
							: "Done"}
				<span className="ml-2 text-gray-400 text-sm">({tasks.length})</span>
			</h2>
			<div
				className={`space-y-3 min-h-[100px] ${isOver ? "bg-blue-50/50 rounded-lg p-2" : ""}`}
				onDragOver={(e) => {
					e.preventDefault();
					// If dragging over the empty space at the bottom
					const rect = e.currentTarget.getBoundingClientRect();
					if (e.clientY > rect.bottom - 60) {
						setDraggedOverIndex(tasks.length);
					}
				}}
			>
				{tasks.map((task, index) => (
					<React.Fragment key={`${task.id}-container`}>
						{draggedOverIndex === index && (
							<div
								key={`${task.id}-placeholder-top`}
								className="h-20 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/50 transform transition-all duration-200 ease-in-out"
							/>
						)}
						<div
							key={`${task.id}-wrapper`}
							onDragOver={(e) => {
								e.preventDefault();
								const rect = e.currentTarget.getBoundingClientRect();
								const midpoint = rect.top + rect.height / 2;
								if (e.clientY < midpoint) {
									setDraggedOverIndex(index);
								} else {
									setDraggedOverIndex(index + 1);
								}
							}}
						>
							<TaskCard
								task={task}
								index={index}
								onEdit={onEdit}
								onDelete={onDelete}
								allTasks={allTasks}
							/>
						</div>
					</React.Fragment>
				))}
				{draggedOverIndex === tasks.length && (
					<div
						key="final-placeholder"
						className="h-20 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/50 transform transition-all duration-200 ease-in-out"
					/>
				)}
				{isOver && tasks.length === 0 && !draggedOverIndex && (
					<div className="h-24 border-2 border-dashed border-blue-200 rounded-lg flex items-center justify-center">
						<p className="text-sm text-blue-500">Drop task here</p>
					</div>
				)}
			</div>
		</div>
	);
}
