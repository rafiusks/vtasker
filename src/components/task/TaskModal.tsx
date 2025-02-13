import { useEffect, useRef, useState } from "react";
import type { Task } from "../../types";
import type {
	TaskStatusEntity,
	TaskPriorityEntity,
	TaskTypeEntity,
} from "../../types/typeReference";
import { TaskForm } from "./TaskForm";
import { ConfirmDialog } from "../common/ConfirmDialog";

interface TaskModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: Partial<Task>) => void;
	onDelete?: () => void;
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
	onDelete,
	initialData,
	isLoading = false,
	statusOptions,
	priorityOptions,
	typeOptions,
}: TaskModalProps) => {
	const modalRef = useRef<HTMLDialogElement>(null);
	const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

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

	const handleDelete = () => {
		setIsConfirmDeleteOpen(true);
	};

	const handleConfirmDelete = () => {
		onDelete?.();
		setIsConfirmDeleteOpen(false);
	};

	if (!isOpen) return null;

	return (
		<>
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
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xl font-semibold">
							{initialData ? "Edit" : "Create"} Task
						</h2>
						{initialData && onDelete && (
							<button
								type="button"
								onClick={handleDelete}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										handleDelete();
									}
								}}
								className="text-red-600 hover:text-red-700 px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
								data-testid="delete-task-button"
							>
								Delete Task
							</button>
						)}
					</div>
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

			<ConfirmDialog
				isOpen={isConfirmDeleteOpen}
				onClose={() => setIsConfirmDeleteOpen(false)}
				onConfirm={handleConfirmDelete}
				title="Delete Task"
				message="Are you sure you want to delete this task? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				isDangerous={true}
			/>
		</>
	);
};
