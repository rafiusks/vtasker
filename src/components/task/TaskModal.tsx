import type { Task } from "../../types/task";
import type {
	TaskStatusEntity,
	TaskPriorityEntity,
	TaskTypeEntity,
} from "../../types/typeReference";
import { TaskForm } from "./TaskForm";

interface TaskModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: Partial<Task>) => void;
	initialData?: Partial<Task>;
	isLoading?: boolean;
	statusOptions: TaskStatusEntity[];
	priorityOptions: TaskPriorityEntity[];
	typeOptions: TaskTypeEntity[];
}

export const TaskModal = ({
	isOpen,
	onClose,
	onSubmit,
	initialData,
	isLoading = false,
	statusOptions,
	priorityOptions,
	typeOptions,
}: TaskModalProps) => {
	if (!isOpen) return null;

	const handleBackdropInteraction = () => {
		onClose();
	};

	return (
		<>
			<div
				className="fixed inset-0 bg-black bg-opacity-50 z-40"
				onClick={handleBackdropInteraction}
				onKeyDown={(e) => {
					if (e.key === "Escape") {
						handleBackdropInteraction();
					}
				}}
				role="button"
				tabIndex={0}
				data-testid="modal-backdrop"
			/>
			<div className="fixed inset-0 flex items-center justify-center z-50">
				<div
					className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg"
					data-testid="create-task-modal"
					onClick={(e) => e.stopPropagation()}
					onKeyDown={(e) => e.stopPropagation()}
				>
					<h2 className="text-xl font-semibold mb-4">
						{initialData ? "Edit" : "Create"} Task
					</h2>
					<TaskForm
						onSubmit={onSubmit}
						onCancel={onClose}
						initialData={initialData}
						isLoading={isLoading}
						statusOptions={statusOptions}
						priorityOptions={priorityOptions}
						typeOptions={typeOptions}
					/>
				</div>
			</div>
		</>
	);
};
