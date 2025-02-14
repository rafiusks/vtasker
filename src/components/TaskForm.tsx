import { useState } from "react";
import type { Task, TaskMetadata, TaskRelationships } from "../types";
import { Input } from "./common/Input";
import { TextArea } from "./common/TextArea";
import { Button } from "./common/Button";
import { SELECT_OPTIONS } from "../types/typeReference";
import { LoadingSpinner } from "./common/LoadingSpinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema } from "../validations/task";
import { Controller } from "react-hook-form";

const defaultMetadata: TaskMetadata = {
	created_at: new Date().toISOString(),
	updated_at: new Date().toISOString(),
};

const defaultRelationships: TaskRelationships = {
	dependencies: [],
	labels: [],
};

interface TaskFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (task: Partial<Task>) => void;
	task?: Task;
	isLoading?: boolean;
}

export const TaskForm = ({
	isOpen,
	onClose,
	onSubmit,
	task,
	isLoading = false,
}: TaskFormProps) => {
	const { control, handleSubmit, formState } = useForm<Task>({
		resolver: zodResolver(taskSchema),
		defaultValues: task || {
			title: "",
			description: "",
			status_id: 1,
			priority_id: 1,
			type_id: 1
		}
	});

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value } = e.target;
		if (name === "status_id" || name === "priority_id" || name === "type_id") {
			setFormData((prev: Partial<Task>) => ({
				...prev,
				[name]: Number.parseInt(value, 10),
			}));
		} else {
			setFormData((prev: Partial<Task>) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const onSubmitForm = (data: Partial<Task>) => {
		onSubmit({ ...data });
	};

	if (!isOpen) return null;

	const statusOptions = SELECT_OPTIONS.STATUS;
	const priorityOptions = SELECT_OPTIONS.PRIORITY;
	const typeOptions = SELECT_OPTIONS.TYPE;

	console.log("TaskForm render state:", {
		isLoading,
		statusOptions,
		priorityOptions,
		typeOptions,
	});

	if (
		isLoading ||
		!statusOptions.length ||
		!priorityOptions.length ||
		!typeOptions.length
	) {
		console.log("TaskForm showing loading state");
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
				<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
					<div className="flex justify-center items-center h-48">
						<LoadingSpinner />
					</div>
				</div>
			</div>
		);
	}

	console.log("Task form options:", {
		statusOptions,
		priorityOptions,
		typeOptions,
	});

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
			<div
				className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
				data-testid="task-form"
			>
				<h2 className="text-xl font-semibold text-gray-900 mb-4">
					{task ? "Edit Task" : "Create Task"}
				</h2>

				<form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
					<Controller
						name="title"
						control={control}
						render={({ field }) => (
							<Input
								{...field}
								label="Title"
								data-testid="task-title-input"
								aria-invalid={!!formState.errors.title}
								aria-errormessage={formState.errors.title ? "title-error" : undefined}
							/>
						)}
					/>

					{formState.errors.title && (
						<p 
							id="title-error" 
							className="text-red-500 text-sm mt-1" 
							role="alert"
							data-testid="title-error"
						>
							{formState.errors.title.message}
						</p>
					)}

					<TextArea
						label="Description"
						name="description"
						value={task?.description || ""}
						onChange={handleChange}
						rows={3}
						data-testid="task-description-input"
					/>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="status_id"
								className="block text-sm font-medium text-gray-700"
							>
								Status
							</label>
							<select
								id="status_id"
								name="status_id"
								value={task?.status_id || 1}
								onChange={handleChange}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
								required
								data-testid="task-status-select"
							>
								{statusOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>

						<div>
							<label
								htmlFor="priority_id"
								className="block text-sm font-medium text-gray-700"
							>
								Priority
							</label>
							<select
								id="priority_id"
								name="priority_id"
								value={task?.priority_id || 1}
								onChange={handleChange}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
								required
								data-testid="task-priority-select"
							>
								{priorityOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>
					</div>

					<div>
						<label
							htmlFor="type_id"
							className="block text-sm font-medium text-gray-700"
						>
							Type
						</label>
						<select
							id="type_id"
							name="type_id"
							value={task?.type_id || 1}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
							required
							data-testid="task-type-select"
						>
							{typeOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>

					<div className="flex justify-end space-x-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							data-testid="cancel-task-button"
						>
							Cancel
						</Button>
						<Button 
							type="submit" 
							data-testid="submit-task-button"
							disabled={formState.isSubmitting}
						>
							{task ? "Save Changes" : "Create Task"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};
