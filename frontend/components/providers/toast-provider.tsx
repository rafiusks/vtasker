"use client";

import {
	Toast,
	ToastProvider as ToastProviderPrimitive,
	ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const { toasts } = useToast();

	return (
		<ToastProviderPrimitive>
			{children}
			{toasts.map(({ id, ...props }) => (
				<Toast key={id} {...props} />
			))}
			<ToastViewport />
		</ToastProviderPrimitive>
	);
}
