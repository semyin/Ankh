import { useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { renderMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";

export function MarkdownEditor({
	id,
	value,
	onChange,
	placeholder,
	className,
	heightClassName = "h-[620px]",
	textareaRef,
}: {
	id: string;
	value: string;
	onChange: (next: string) => void;
	placeholder?: string;
	className?: string;
	heightClassName?: string;
	textareaRef?: React.Ref<HTMLTextAreaElement>;
}) {
	const html = useMemo(() => renderMarkdown(value || ""), [value]);

	return (
		<div className={cn("grid gap-4 lg:grid-cols-2", className)}>
			<div className="space-y-2">
				<div className="text-xs font-medium text-muted-foreground">Write</div>
				<Textarea
					id={id}
					ref={textareaRef}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					className={cn(
						heightClassName,
						"resize-none font-mono text-sm leading-6",
					)}
					spellCheck={false}
				/>
			</div>

			<div className="space-y-2">
				<div className="text-xs font-medium text-muted-foreground">Preview</div>
				<div
					className={cn(
						heightClassName,
						"overflow-auto rounded-md border border-input bg-background p-4 text-foreground",
					)}
				>
					{value.trim().length === 0 ? (
						<div className="text-sm text-muted-foreground">
							Start typing to see the preview.
						</div>
					) : (
						<div
							className="prose max-w-none"
							dangerouslySetInnerHTML={{ __html: html }}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
