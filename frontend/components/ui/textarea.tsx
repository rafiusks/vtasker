import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	maxLength?: number;
	showCount?: boolean;
	autoResize?: boolean;
	error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	(
		{ className, maxLength, showCount, autoResize, error, onChange, ...props },
		ref,
	) => {
		const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
		const [charCount, setCharCount] = React.useState(0);
		const mergedRef = React.useMemo(
			() => (node: HTMLTextAreaElement) => {
				textareaRef.current = node;
				if (typeof ref === "function") {
					ref(node);
				} else if (ref) {
					ref.current = node;
				}
			},
			[ref],
		);

		const adjustHeight = React.useCallback(() => {
			const textarea = textareaRef.current;
			if (textarea && autoResize) {
				textarea.style.height = "auto";
				textarea.style.height = `${textarea.scrollHeight}px`;
			}
		}, [autoResize]);

		const handleChange = React.useCallback(
			(e: React.ChangeEvent<HTMLTextAreaElement>) => {
				if (maxLength && e.target.value.length > maxLength) {
					e.target.value = e.target.value.slice(0, maxLength);
				}
				setCharCount(e.target.value.length);
				if (autoResize) {
					adjustHeight();
				}
				onChange?.(e);
			},
			[maxLength, autoResize, adjustHeight, onChange],
		);

		// Adjust height on mount and when content changes
		React.useEffect(() => {
			if (autoResize) {
				adjustHeight();
			}
		}, [autoResize, adjustHeight, props.value, props.defaultValue]);

		// Initialize character count
		React.useEffect(() => {
			setCharCount(
				props.value?.toString().length ||
					props.defaultValue?.toString().length ||
					0,
			);
		}, [props.value, props.defaultValue]);

		return (
			<div className="relative">
				<textarea
					className={cn(
						"flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
						error && "border-destructive focus-visible:ring-destructive",
						className,
					)}
					ref={mergedRef}
					onChange={handleChange}
					{...props}
				/>
				{(showCount || error) && (
					<div className="mt-1 flex justify-between text-xs">
						{error && <span className="text-destructive">{error}</span>}
						{showCount && (
							<span
								className={cn(
									"text-muted-foreground",
									maxLength && charCount >= maxLength && "text-destructive",
									error ? "ml-auto" : "",
								)}
							>
								{charCount}
								{maxLength && ` / ${maxLength}`}
							</span>
						)}
					</div>
				)}
			</div>
		);
	},
);
Textarea.displayName = "Textarea";

export { Textarea };
