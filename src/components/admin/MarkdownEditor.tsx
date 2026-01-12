import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MdEditor from "react-markdown-editor-lite";
import type { UploadFunc } from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import "./MarkdownEditor.css";

import { renderMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MarkdownEditorProps = {
	id: string;
	value: string;
	onChange: (next: string) => void;
	placeholder?: string;
	className?: string;
	height?: number;
	onUploadImage?: (file: File) => Promise<{ url: string }>;
};

const globalWithReact = globalThis as typeof globalThis & {
	React?: typeof React;
};

if (!globalWithReact.React) {
	globalWithReact.React = React;
}

export function MarkdownEditor({
	id,
	value,
	onChange,
	placeholder,
	className,
	height = 620,
	onUploadImage,
}: MarkdownEditorProps) {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [isDesktop, setIsDesktop] = useState(() =>
		typeof window === "undefined"
			? true
			: window.matchMedia("(min-width: 1024px)").matches,
	);
	const [imageDialogOpen, setImageDialogOpen] = useState(false);
	const [imageDialogPromise, setImageDialogPromise] = useState<{
		resolve: (value: { url: string; text?: string }) => void;
		reject: (reason?: unknown) => void;
	} | null>(null);
	const [imageUrl, setImageUrl] = useState("");
	const [imageAlt, setImageAlt] = useState("");
	const [uploadingImage, setUploadingImage] = useState(false);
	const [imageError, setImageError] = useState<string | null>(null);

	const handleImageUpload = useCallback<UploadFunc | undefined>(
		onUploadImage
			? async (file) => {
					const result = await onUploadImage(file);
					return result.url;
				}
			: undefined,
		[onUploadImage],
	);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const mediaQuery = window.matchMedia("(min-width: 1024px)");
		const listener = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
		setIsDesktop(mediaQuery.matches);
		if (typeof mediaQuery.addEventListener === "function") {
			mediaQuery.addEventListener("change", listener);
			return () => mediaQuery.removeEventListener("change", listener);
		}
		mediaQuery.addListener(listener);
		return () => mediaQuery.removeListener(listener);
	}, []);

	const openImageDialog = useCallback(() => {
		setImageUrl("");
		setImageAlt("");
		setImageError(null);
		setImageDialogOpen(true);
	}, []);

	const closeImageDialog = useCallback(
		(cancelled: boolean) => {
			setImageDialogOpen(false);
			if (cancelled) {
				imageDialogPromise?.reject?.(new Error("Image insert cancelled"));
			}
			setImageDialogPromise(null);
			setUploadingImage(false);
		},
		[imageDialogPromise],
	);

	const confirmImageDialog = useCallback(() => {
		if (!imageUrl.trim()) {
			setImageError("Please enter an image URL.");
			return;
		}
		imageDialogPromise?.resolve({
			url: imageUrl.trim(),
			text: imageAlt.trim() || undefined,
		});
		closeImageDialog(false);
	}, [imageAlt, imageDialogPromise, imageUrl, closeImageDialog]);

	const handleCustomImageUpload = useCallback(() => {
		return new Promise<{ url: string; text?: string }>((resolve, reject) => {
			setImageDialogPromise({ resolve, reject });
			openImageDialog();
		});
	}, [openImageDialog]);

	const handleImageFileChange = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			event.target.value = "";
			if (!file) return;
			if (!onUploadImage) {
				setImageError("Image upload is disabled.");
				return;
			}
			setImageError(null);
			setUploadingImage(true);
			try {
				const result = await onUploadImage(file);
				setImageUrl(result.url);
				if (!imageAlt.trim()) setImageAlt(file.name);
			} catch (error) {
				setImageError(
					error instanceof Error ? error.message : "Upload failed. Try again.",
				);
			} finally {
				setUploadingImage(false);
			}
		},
		[imageAlt, onUploadImage],
	);

	const imageDialog = useMemo(() => {
		if (!imageDialogOpen) return null;
		return (
			<div className="markdown-editor__dialog fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
				<div className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card p-6 shadow-2xl">
					<div className="space-y-2">
						<h3 className="text-lg font-semibold">Insert image</h3>
						<p className="text-sm text-muted-foreground">
							Paste a URL or upload a file to embed into your article.
						</p>
					</div>

					<div className="space-y-3">
						<div className="space-y-1.5">
							<label className="text-xs font-medium text-muted-foreground">
								Image URL
							</label>
							<Input
								value={imageUrl}
								onChange={(event) => {
									setImageUrl(event.target.value);
									setImageError(null);
								}}
								placeholder="https://example.com/image.png"
							/>
						</div>

						<div className="space-y-1.5">
							<label className="text-xs font-medium text-muted-foreground">
								Alt text
							</label>
							<Input
								value={imageAlt}
								onChange={(event) => setImageAlt(event.target.value)}
								placeholder="Optional description"
							/>
						</div>

						{onUploadImage ? (
							<div className="flex items-center gap-3">
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleImageFileChange}
								/>
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={uploadingImage}
									onClick={() => fileInputRef.current?.click()}
								>
									{uploadingImage ? "Uploading..." : "Upload image"}
								</Button>
								{uploadingImage ? (
									<span className="text-xs text-muted-foreground">
										Please wait...
									</span>
								) : null}
							</div>
						) : null}

						{imageError ? (
							<div className="text-sm text-destructive">{imageError}</div>
						) : null}
					</div>

					<div className="flex items-center justify-end gap-3">
						<Button
							type="button"
							variant="ghost"
							onClick={() => closeImageDialog(true)}
						>
							Cancel
						</Button>
						<Button type="button" onClick={confirmImageDialog}>
							Insert
						</Button>
					</div>
				</div>
			</div>
		);
	}, [
		closeImageDialog,
		confirmImageDialog,
		handleImageFileChange,
		imageAlt,
		imageDialogOpen,
		imageError,
		imageUrl,
		onUploadImage,
		uploadingImage,
	]);

	return (
		<div className={cn("markdown-editor", className)}>
			<MdEditor
				id={id}
				className="markdown-editor__instance"
				value={value}
				style={{ height }}
				placeholder={placeholder}
				renderHTML={(text) => renderMarkdown(text)}
				markdownClass="markdown-editor__md"
				htmlClass="markdown-editor__preview prose max-w-none"
				view={
					isDesktop
						? { menu: true, md: true, html: true }
						: { menu: true, md: true, html: false }
				}
				canView={
					isDesktop
						? {
								menu: true,
								md: true,
								html: true,
								both: true,
								fullScreen: true,
								hideMenu: true,
							}
						: {
								menu: true,
								md: true,
								html: true,
								both: false,
								fullScreen: true,
								hideMenu: true,
							}
				}
				shortcuts
				allowPasteImage={Boolean(onUploadImage)}
				onImageUpload={handleImageUpload}
				onCustomImageUpload={handleCustomImageUpload}
				onChange={({ text }) => onChange(text)}
			/>
			{imageDialog}
		</div>
	);
}
