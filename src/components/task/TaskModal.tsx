import { useEffect, useRef } from "react";
import type { Task } from "../../types";
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
	const modalRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		if (isOpen) {
			modalRef.current?.showModal();
		} else {
			modalRef.current?.close();
		}
	}, [isOpen]);

	const handleBackdropClick = (e: React.MouseEvent) => {
		const dialogDimensions = modalRef.current?.getBoundingClientRect();
		if (!dialogDimensions) return;

		if (
			e.clientX < dialogDimensions.left ||
			e.clientX > dialogDimensions.right ||
			e.clientY < dialogDimensions.top ||
			e.clientY > dialogDimensions.bottom
		) {
			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<dialog
			ref={modalRef}
			className="fixed inset-0 bg-black/50 w-full h-full m-0 p-0"
			onClick={handleBackdropClick}
			onClose={onClose}
			data-testid="task-modal"
		>
			<div
				className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-lg"
				data-testid="create-task-modal"
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
		</dialog>
	);
};
