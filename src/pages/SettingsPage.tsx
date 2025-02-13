import { useAuth } from "../contexts/auth/context";
import { Button } from "../components/common/Button";
import { useState } from "react";
import { toast } from "sonner";

export const SettingsPage = () => {
	const { user, updateUser } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [fullName, setFullName] = useState(user?.full_name || "");
	const [email, setEmail] = useState(user?.email || "");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		setIsLoading(true);
		try {
			await updateUser({
				...user,
				full_name: fullName,
				email,
			});
			setIsEditing(false);
			toast.success("Profile updated successfully");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to update profile",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto">
			<h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

			<div className="bg-white shadow rounded-lg p-6">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">
					Profile Settings
				</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="full_name"
							className="block text-sm font-medium text-gray-700"
						>
							Full Name
						</label>
						<input
							type="text"
							id="full_name"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							disabled={!isEditing}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50"
						/>
					</div>

					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700"
						>
							Email
						</label>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={!isEditing}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50"
						/>
					</div>

					<div className="flex justify-end space-x-3">
						{isEditing ? (
							<>
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsEditing(false)}
									disabled={isLoading}
								>
									Cancel
								</Button>
								<Button type="submit" isLoading={isLoading}>
									Save Changes
								</Button>
							</>
						) : (
							<Button type="button" onClick={() => setIsEditing(true)}>
								Edit Profile
							</Button>
						)}
					</div>
				</form>
			</div>
		</div>
	);
};
