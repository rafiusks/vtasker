import { useEffect, useRef } from "react";
import { Button } from "./Button";

interface ConfirmDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	isDangerous?: boolean;
}

export const ConfirmDialog = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = "Confirm",
	cancelText = "Cancel",
	isDangerous = false,
}: ConfirmDialogProps) => {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		if (isOpen) {
			dialogRef.current?.showModal();
		} else {
			dialogRef.current?.close();
		}
	}, [isOpen]);

	const handleBackdropClick = (e: React.MouseEvent) => {
		const dialogDimensions = dialogRef.current?.getBoundingClientRect();
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
			ref={dialogRef}
			className="fixed inset-0 bg-black/50 w-full h-full m-0 p-0"
			onClick={handleBackdropClick}
			onKeyDown={(e) => {
				if (e.key === "Escape") {
					onClose();
				}
			}}
			onClose={onClose}
			data-testid="confirm-dialog"
		>
			<div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
				<h2 className="text-lg font-semibold text-gray-900">{title}</h2>
				<p className="mt-2 text-sm text-gray-500">{message}</p>
				<div className="mt-4 flex justify-end gap-2">
					<Button
						type="button"
						variant="secondary"
						onClick={onClose}
						data-testid="confirm-dialog-cancel"
					>
						{cancelText}
					</Button>
					<Button
						type="button"
						variant={isDangerous ? "danger" : "primary"}
						onClick={onConfirm}
						data-testid="confirm-dialog-confirm"
					>
						{confirmText}
					</Button>
				</div>
			</div>
		</dialog>
	);
};
