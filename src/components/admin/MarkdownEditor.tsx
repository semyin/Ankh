import {
	Bold,
	Code,
	Heading2,
	Image as ImageIcon,
	Italic,
	Link as LinkIcon,
	List,
	ListOrdered,
	Quote,
	Strikethrough,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { renderMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";

function setRef<T>(ref: React.Ref<T> | undefined, value: T) {
	if (!ref) return;
	if (typeof ref === "function") ref(value);
	else (ref as React.MutableRefObject<T>).current = value;
}

function insertAtSelection(params: {
	textarea: HTMLTextAreaElement | null;
	value: string;
	onChange: (next: string) => void;
	text: string;
}) {
	const { textarea, value, onChange, text } = params;
	if (!textarea) {
		onChange(`${value}${value.endsWith("\n") ? "" : "\n"}${text}`);
		return;
	}

	const start = textarea.selectionStart ?? value.length;
	const end = textarea.selectionEnd ?? start;
	const next = `${value.slice(0, start)}${text}${value.slice(end)}`;
	onChange(next);

	requestAnimationFrame(() => {
		textarea.focus();
		const cursor = start + text.length;
		textarea.setSelectionRange(cursor, cursor);
	});
}

function insertBlock(params: {
	textarea: HTMLTextAreaElement | null;
	value: string;
	onChange: (next: string) => void;
	block: string;
}) {
	const { textarea, value, onChange, block } = params;
	if (!textarea) {
		onChange(`${value}${value.endsWith("\n") ? "" : "\n"}${block}\n`);
		return;
	}

	const start = textarea.selectionStart ?? value.length;
	const before = start > 0 && value[start - 1] !== "\n" ? "\n" : "";
	const after = value[start] && value[start] !== "\n" ? "\n" : "";
	insertAtSelection({
		textarea,
		value,
		onChange,
		text: `${before}${block}${after}`,
	});
}

function wrapSelection(params: {
	textarea: HTMLTextAreaElement | null;
	value: string;
	onChange: (next: string) => void;
	prefix: string;
	suffix?: string;
	placeholder?: string;
}) {
	const {
		textarea,
		value,
		onChange,
		prefix,
		placeholder = "",
		suffix = prefix,
	} = params;

	if (!textarea) {
		onChange(`${value}${prefix}${placeholder}${suffix}`);
		return;
	}

	const start = textarea.selectionStart ?? 0;
	const end = textarea.selectionEnd ?? start;
	const selected = value.slice(start, end) || placeholder;
	const inserted = `${prefix}${selected}${suffix}`;
	const next = `${value.slice(0, start)}${inserted}${value.slice(end)}`;
	onChange(next);

	requestAnimationFrame(() => {
		textarea.focus();
		textarea.setSelectionRange(
			start + prefix.length,
			start + prefix.length + selected.length,
		);
	});
}

export function MarkdownEditor({
	id,
	value,
	onChange,
	placeholder,
	className,
	heightClassName = "h-[620px]",
	textareaRef,
	onUploadImage,
}: {
	id: string;
	value: string;
	onChange: (next: string) => void;
	placeholder?: string;
	className?: string;
	heightClassName?: string;
	textareaRef?: React.Ref<HTMLTextAreaElement>;
	onUploadImage?: (file: File) => Promise<{ url: string }>;
}) {
	const html = useMemo(() => renderMarkdown(value || ""), [value]);
	const internalTextareaRef = useRef<HTMLTextAreaElement | null>(null);
	const imageTriggerRef = useRef<HTMLButtonElement | null>(null);
	const imagePopoverRef = useRef<HTMLDivElement | null>(null);

	const [imagePopoverOpen, setImagePopoverOpen] = useState(false);
	const [imageUrl, setImageUrl] = useState("");
	const [imageAlt, setImageAlt] = useState("");
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);

	useEffect(() => {
		if (!imagePopoverOpen) return;

		const onPointerDown = (event: PointerEvent) => {
			const target = event.target as Node | null;
			if (!target) return;
			if (imageTriggerRef.current?.contains(target)) return;
			if (imagePopoverRef.current?.contains(target)) return;
			setImagePopoverOpen(false);
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setImagePopoverOpen(false);
		};

		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [imagePopoverOpen]);

	return (
		<div className={cn("grid gap-4 lg:grid-cols-2", className)}>
			<div className="space-y-2">
				<div className="flex items-center justify-between gap-2">
					<div className="text-xs font-medium text-muted-foreground">Write</div>
					<div className="flex items-center gap-1">
						<ToolbarButton
							label="Bold"
							onClick={() =>
								wrapSelection({
									textarea: internalTextareaRef.current,
									value,
									onChange,
									prefix: "**",
									placeholder: "bold",
								})
							}
						>
							<Bold className="h-4 w-4" />
						</ToolbarButton>
						<ToolbarButton
							label="Italic"
							onClick={() =>
								wrapSelection({
									textarea: internalTextareaRef.current,
									value,
									onChange,
									prefix: "*",
									placeholder: "italic",
								})
							}
						>
							<Italic className="h-4 w-4" />
						</ToolbarButton>
						<ToolbarButton
							label="Strike"
							onClick={() =>
								wrapSelection({
									textarea: internalTextareaRef.current,
									value,
									onChange,
									prefix: "~~",
									placeholder: "strike",
								})
							}
						>
							<Strikethrough className="h-4 w-4" />
						</ToolbarButton>
						<ToolbarButton
							label="Inline code"
							onClick={() =>
								wrapSelection({
									textarea: internalTextareaRef.current,
									value,
									onChange,
									prefix: "`",
									placeholder: "code",
								})
							}
						>
							<Code className="h-4 w-4" />
						</ToolbarButton>
						<ToolbarButton
							label="Heading"
							onClick={() =>
								insertBlock({
									textarea: internalTextareaRef.current,
									value,
									onChange,
									block: "## Heading",
								})
							}
						>
							<Heading2 className="h-4 w-4" />
						</ToolbarButton>
						<ToolbarButton
							label="Quote"
							onClick={() =>
								insertBlock({
									textarea: internalTextareaRef.current,
									value,
									onChange,
									block: "> Quote",
								})
							}
						>
							<Quote className="h-4 w-4" />
						</ToolbarButton>
						<ToolbarButton
							label="List"
							onClick={() =>
								insertBlock({
									textarea: internalTextareaRef.current,
									value,
									onChange,
									block: "- Item",
								})
							}
						>
							<List className="h-4 w-4" />
						</ToolbarButton>
						<ToolbarButton
							label="Ordered list"
							onClick={() =>
								insertBlock({
									textarea: internalTextareaRef.current,
									value,
									onChange,
									block: "1. Item",
								})
							}
						>
							<ListOrdered className="h-4 w-4" />
						</ToolbarButton>
						<ToolbarButton
							label="Link"
							onClick={() =>
								wrapSelection({
									textarea: internalTextareaRef.current,
									value,
									onChange,
									prefix: "[",
									suffix: "](https://)",
									placeholder: "link",
								})
							}
						>
							<LinkIcon className="h-4 w-4" />
						</ToolbarButton>

						<div className="relative">
							<ToolbarButton
								label="Image"
								onClick={() => setImagePopoverOpen((v) => !v)}
								buttonRef={imageTriggerRef}
							>
								<ImageIcon className="h-4 w-4" />
							</ToolbarButton>
							{imagePopoverOpen ? (
								<div
									ref={imagePopoverRef}
									className="absolute right-0 top-full z-50 mt-2 w-[320px] rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-lg"
								>
									<div className="space-y-3">
										<div className="space-y-2">
											<div className="text-xs font-medium text-muted-foreground">
												Image URL
											</div>
											<Input
												value={imageUrl}
												onChange={(e) => setImageUrl(e.target.value)}
												placeholder="https://..."
												className="h-8"
											/>
										</div>

										<div className="space-y-2">
											<div className="text-xs font-medium text-muted-foreground">
												Alt text
											</div>
											<Input
												value={imageAlt}
												onChange={(e) => setImageAlt(e.target.value)}
												placeholder="image"
												className="h-8"
											/>
										</div>

										<div className="flex items-center justify-end gap-2">
											{onUploadImage ? (
												<>
													<input
														type="file"
														accept="image/*"
														className="hidden"
														id={`${id}-image-upload`}
														onChange={async (e) => {
															const file = e.target.files?.[0];
															e.target.value = "";
															if (!file) return;
															setUploadError(null);
															setUploading(true);
															try {
																const res = await onUploadImage(file);
																const markdown = `![${imageAlt.trim() || file.name}](${res.url})`;
																insertAtSelection({
																	textarea: internalTextareaRef.current,
																	value,
																	onChange,
																	text: markdown,
																});
																setImagePopoverOpen(false);
															} catch (err) {
																setUploadError(
																	err instanceof Error
																		? err.message
																		: "Upload failed",
																);
															} finally {
																setUploading(false);
															}
														}}
													/>
													<Button
														type="button"
														variant="outline"
														size="sm"
														disabled={uploading}
														onClick={() =>
															document
																.getElementById(`${id}-image-upload`)
																?.click()
														}
													>
														{uploading ? "Uploading..." : "Upload"}
													</Button>
												</>
											) : null}

											<Button
												type="button"
												size="sm"
												variant="secondary"
												disabled={!imageUrl.trim()}
												onClick={() => {
													const markdown = `![${imageAlt.trim() || "image"}](${imageUrl.trim()})`;
													insertAtSelection({
														textarea: internalTextareaRef.current,
														value,
														onChange,
														text: markdown,
													});
													setImagePopoverOpen(false);
												}}
											>
												Insert
											</Button>
										</div>

										{uploadError ? (
											<div className="text-xs text-destructive">
												{uploadError}
											</div>
										) : null}
									</div>
								</div>
							) : null}
						</div>
					</div>
				</div>
				<Textarea
					id={id}
					ref={(el) => {
						internalTextareaRef.current = el;
						setRef(textareaRef, el);
					}}
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

function ToolbarButton({
	children,
	label,
	onClick,
	buttonRef,
}: {
	children: React.ReactNode;
	label: string;
	onClick: () => void;
	buttonRef?: React.Ref<HTMLButtonElement>;
}) {
	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			onClick={onClick}
			ref={buttonRef}
			aria-label={label}
			title={label}
			className="h-8 w-8"
		>
			{children}
		</Button>
	);
}
