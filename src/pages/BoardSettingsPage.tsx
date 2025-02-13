import { useState, useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boardAPI } from "../api/client";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { toast } from "sonner";
import { Breadcrumbs } from "../components/common/Breadcrumbs";
import { useAuth } from "../contexts/auth/context";
import type { Board } from "../types/board";

export const BoardSettingsPage = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { user } = useAuth();
	const { boardSlug } = useParams({ from: "/b/$boardSlug/settings" });
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		slug: "",
		description: "",
		is_public: false,
	});

	const {
		data: board,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["boards", boardSlug],
		queryFn: () => {
			if (!boardSlug) throw new Error("Board slug is required");
			return boardAPI.getBoard(boardSlug);
		},
		enabled: !!boardSlug,
	});

	// Update form data when board is loaded
	useEffect(() => {
		if (board) {
			setFormData({
				name: board.name,
				slug: board.slug,
				description: board.description || "",
				is_public: board.is_public,
			});
		}
	}, [board]);

	const { mutate: updateBoard, isPending } = useMutation({
		mutationFn: async (updates: {
			name: string;
			slug: string;
			description: string;
			is_public: boolean;
		}) => {
			if (!board) throw new Error("Board not found");
			
			// Prepare the update input with required fields
			const input = {
				is_public: updates.is_public,
				is_active: true, // Required field with default value
				// Optional fields as properties
				...(updates.name !== board.name && { name: updates.name }),
				...(updates.slug !== board.slug && { slug: updates.slug }),
				...(updates.description !== board.description && {
					description: updates.description,
				}),
			};
			
			return boardAPI.updateBoard(board.id, input);
		},
		onSuccess: (data: Board) => {
			// Invalidate both the old and new board queries
			queryClient.invalidateQueries({ queryKey: ["boards", boardSlug] });
			if (data.slug !== boardSlug) {
				queryClient.invalidateQueries({ queryKey: ["boards", data.slug] });
			}
			queryClient.invalidateQueries({ queryKey: ["boards"] }); // Invalidate boards list

			toast.success("Board updated successfully");

			// If slug changed, navigate to the new URL
			if (data.slug !== boardSlug) {
				// First navigate to the board page
				navigate({
					to: "/b/$boardSlug",
					params: { boardSlug: data.slug },
				});
				// Then navigate to settings to avoid stale data
				setTimeout(() => {
					navigate({
						to: "/b/$boardSlug/settings",
						params: { boardSlug: data.slug },
					});
				}, 100);
			}
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to update board",
			);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		updateBoard(formData);
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

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-64">
				<LoadingSpinner />
			</div>
		);
	}

	if (error || !board) {
		return (
			<div className="text-center py-12">
				<p className="text-red-500">
					{error instanceof Error ? error.message : "Failed to load board"}
				</p>
			</div>
		);
	}

	const canManageBoard =
		user?.id === board.owner_id ||
		board.members?.some(
			(member) => member.user_id === user?.id && member.role === "admin",
		);

	if (!canManageBoard) {
		return (
			<div className="text-center py-12">
				<p className="text-red-500">
					You don&apos;t have permission to manage this board
				</p>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<Breadcrumbs
				items={[
					{ label: "Dashboard", to: "/dashboard" },
					{ label: "Boards", to: "/boards" },
					{ label: board.name, to: `/b/${board.slug}` },
					{ label: "Settings" },
				]}
			/>

			<div className="mt-8">
				<h1 className="text-2xl font-bold text-gray-900 mb-8">
					Board Settings
				</h1>

				<form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
					<Input
						label="Board Name"
						name="name"
						value={formData.name}
						onChange={handleChange}
						required
					/>

					<Input
						label="Board Slug"
						name="slug"
						value={formData.slug}
						onChange={handleChange}
						required
						pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
						title="Lowercase letters, numbers, and hyphens only"
						helperText="Used in the URL. Must be unique."
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

					<div className="flex justify-between pt-6 border-t">
						<Button
							type="button"
							variant="outline"
							className="!bg-red-50 !text-red-600 !border-red-200 hover:!bg-red-100"
							onClick={() => setIsDeleteConfirmOpen(true)}
						>
							Delete Board
						</Button>
						<Button type="submit" isLoading={isPending}>
							Save Changes
						</Button>
					</div>
				</form>
			</div>

			{/* Delete Confirmation Modal */}
			{isDeleteConfirmOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							Delete Board
						</h3>
						<p className="text-gray-500 mb-4">
							Are you sure you want to delete &quot;{board.name}&quot;? This action cannot be undone.
						</p>
						<div className="flex justify-end space-x-3">
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsDeleteConfirmOpen(false)}
							>
								Cancel
							</Button>
							<Button
								type="button"
								className="!bg-red-600 hover:!bg-red-700"
								onClick={async () => {
									try {
										await boardAPI.deleteBoard(board.id);
										toast.success("Board deleted successfully");
										navigate({ to: "/boards" });
									} catch (error) {
										toast.error(
											error instanceof Error
												? error.message
												: "Failed to delete board",
										);
									}
									setIsDeleteConfirmOpen(false);
								}}
							>
								Delete
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
