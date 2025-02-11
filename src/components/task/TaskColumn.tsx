import type { Task, TaskStatus } from "../../types/task";

interface TaskColumnProps {
	status: TaskStatus;
	tasks: Task[];
	onDrop: (taskId: string, statusId: number) => void;
	onEdit: (taskId: string) => void;
	onDelete: (taskId: string) => void;
	isLoading: boolean;
}

export const TaskColumn = ({
	status,
	tasks,
	onDrop,
	onEdit,
	onDelete,
	isLoading,
}: TaskColumnProps) => {
	return (
		<div className="bg-white rounded-lg shadow p-4">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-medium text-gray-900">{status.name}</h3>
				<span className="text-sm text-gray-500">{tasks.length}</span>
			</div>

			<div className="space-y-2">
				{isLoading ? (
					<div className="flex justify-center py-4">
						<div className="animate-spin h-5 w-5 border-2 border-blue-600 rounded-full border-t-transparent" />
					</div>
				) : tasks.length === 0 ? (
					<div className="text-center py-4">
						<p className="text-sm text-gray-500">No tasks</p>
					</div>
				) : (
					tasks.map((task) => (
						<div
							key={task.id}
							className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
						>
							<div className="flex justify-between items-start">
								<h4 className="text-sm font-medium text-gray-900">
									{task.title}
								</h4>
								<div className="flex items-center space-x-2">
									<button
										type="button"
										onClick={() => onEdit(task.id)}
										className="text-gray-400 hover:text-gray-600"
									>
										Edit
									</button>
									<button
										type="button"
										onClick={() => onDelete(task.id)}
										className="text-red-400 hover:text-red-600"
									>
										Delete
									</button>
								</div>
							</div>
							{task.description && (
								<p className="mt-1 text-sm text-gray-600 line-clamp-2">
									{task.description}
								</p>
							)}
						</div>
					))
				)}
			</div>
		</div>
	);
};
