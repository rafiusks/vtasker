import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBoard } from "../../api/board";
import type { CreateBoardInput } from "../../types/board";
import { Button } from "../common/Button";
import { Input } from "../common/Input";

interface CreateBoardModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const CreateBoardModal = ({
	isOpen,
	onClose,
}: CreateBoardModalProps) => {
	const queryClient = useQueryClient();
	const [formData, setFormData] = useState<CreateBoardInput>({
		name: "",
		description: "",
		is_public: false,
	});

	const { mutate: create, isPending: isCreating } = useMutation({
		mutationFn: createBoard,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["boards"] });
			onClose();
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		create(formData);
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value, type } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]:
				type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
		}));
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">
					Create New Board
				</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					<Input
						label="Board Name"
						name="name"
						value={formData.name}
						onChange={handleChange}
						required
						placeholder="Enter board name"
					/>

					<div className="space-y-1">
						<label
							htmlFor="description"
							className="block text-sm font-medium text-gray-700"
						>
							Description
						</label>
						<textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							rows={3}
							className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
							placeholder="Enter board description"
						/>
					</div>

					<div className="flex items-center">
						<input
							type="checkbox"
							id="is_public"
							name="is_public"
							checked={formData.is_public}
							onChange={handleChange}
							className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<label
							htmlFor="is_public"
							className="ml-2 block text-sm text-gray-900"
						>
							Make board public
						</label>
					</div>

					<div className="flex justify-end space-x-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isCreating}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							isLoading={isCreating}
							disabled={!formData.name}
						>
							Create Board
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};
