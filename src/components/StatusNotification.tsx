import type { FC } from "react";
import type { TASK_STATUS } from "../types/typeReference";

interface StatusNotificationProps {
	show: boolean;
	onClose: () => void;
	taskTitle: string;
	status?: (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
}

export const StatusNotification: FC<StatusNotificationProps> = ({
	show,
	onClose,
	taskTitle,
	status,
}) => {
	if (!show) return null;

	return (
		<div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-sm font-medium text-gray-900">
						Task Status Updated
					</h3>
					<p className="mt-1 text-sm text-gray-500">
						{taskTitle} moved to {status?.label || "new status"}
					</p>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="ml-4 inline-flex text-gray-400 hover:text-gray-500"
				>
					<span className="sr-only">Close</span>
					<svg
						className="h-5 w-5"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fillRule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clipRule="evenodd"
						/>
					</svg>
				</button>
			</div>
		</div>
	);
};
