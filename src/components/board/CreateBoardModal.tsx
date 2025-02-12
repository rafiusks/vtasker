import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { boardAPI } from "../../api/client";
import type { CreateBoardInput, Board } from "../../types/board";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { toast } from "sonner";

interface CreateBoardModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const CreateBoardModal = ({
	isOpen,
	onClose,
}: CreateBoardModalProps) => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [formData, setFormData] = useState<CreateBoardInput>({
		name: "",
		slug: "",
		description: "",
		is_public: false,
	});

	const { mutate: create, isPending: isCreating } = useMutation<
		Board,
		Error,
		CreateBoardInput
	>({
		mutationFn: async (input: CreateBoardInput) => {
			// Create the board
			const board = await boardAPI.createBoard(input);
			return board;
		},
		onSuccess: async (board) => {
			console.log("Board created successfully:", board);
			// Close the modal first
			onClose();
			// Invalidate and wait for the boards query to be refetched
			await queryClient.invalidateQueries({ queryKey: ["boards"] });
			// Wait for navigation to complete
			console.log("Navigating to board:", board.id, "with slug:", board.slug);
			await navigate({
				to: "/b/$boardSlug",
				params: { boardSlug: board.slug },
			});
		},
		onError: (error) => {
			console.error("Failed to create board:", error);
			toast.error(error.message);
		},
	});

	const generateSlug = (name: string) => {
		if (!name) return "";
		return name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
	};

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const name = e.target.value;
		setFormData((prev) => ({
			...prev,
			name,
			// Only auto-generate slug if it's empty or was auto-generated before
			description: prev.description,
			is_public: prev.is_public,
		}));
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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		create(formData);
	};

	if (!isOpen) return null;

	const handleBackdropInteraction = () => {
		onClose();
	};

	return (
		<>
			<div
				className="fixed inset-0 bg-black bg-opacity-50"
				onClick={handleBackdropInteraction}
				onKeyDown={(e) => {
					if (e.key === "Escape") {
						handleBackdropInteraction();
					}
				}}
				data-testid="modal-backdrop"
				role="presentation"
			>
				<dialog
					className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-transparent m-0 p-0"
					data-testid="modal-container"
					open
				>
					<div
						className="bg-white p-6 rounded-lg shadow-lg w-96 relative"
						data-testid="create-board-modal"
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
						role="document"
						aria-labelledby="modal-title"
					>
						<h2 id="modal-title" className="text-xl font-bold mb-4">
							Create New Board
						</h2>
						<form onSubmit={handleSubmit}>
							<div className="mb-4">
								<Input
									label="Board Name"
									name="name"
									value={formData.name}
									onChange={handleNameChange}
									required
									placeholder="Enter board name"
									data-testid="board-name-input"
								/>
							</div>
							<div className="mb-4">
								<Input
									label="URL Slug"
									name="slug"
									value={formData.slug}
									onChange={handleChange}
									placeholder="Enter URL slug"
									data-testid="board-slug-input"
									helperText="This will be used in the board's URL. Leave empty to auto-generate."
								/>
							</div>
							<div className="mb-4">
								<Input
									label="Description"
									name="description"
									value={formData.description || ""}
									onChange={handleChange}
									placeholder="Enter board description"
									data-testid="board-description-input"
								/>
							</div>
							<div className="mb-4">
								<label className="flex items-center">
									<input
										type="checkbox"
										name="is_public"
										checked={formData.is_public}
										onChange={(e) =>
											setFormData({
												...formData,
												is_public: e.target.checked,
											})
										}
										className="mr-2"
										data-testid="board-public-checkbox"
									/>
									<span>Public Board</span>
								</label>
							</div>
							<div className="flex justify-end gap-2">
								<Button
									type="button"
									variant="secondary"
									onClick={onClose}
									data-testid="cancel-create-board-button"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									variant="primary"
									disabled={isCreating}
									data-testid="submit-create-board-button"
								>
									{isCreating ? "Creating..." : "Create"}
								</Button>
							</div>
						</form>
					</div>
				</dialog>
			</div>
		</>
	);
};
