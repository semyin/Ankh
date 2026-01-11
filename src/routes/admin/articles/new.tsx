import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ImageUp, Info, Save } from "lucide-react";
import { useRef, useState } from "react";
import { AdminPageHeader, AdminSurface } from "@/components/admin/AdminLayout";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { TagMultiSelect } from "@/components/admin/TagMultiSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectMenu } from "@/components/ui/select-menu";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	createMeta,
	createArticle,
	getCategories,
	getTags,
	setArticleTags,
	uploadImage,
} from "@/lib/api";

export const Route = createFileRoute("/admin/articles/new")({
	component: AdminNewArticlePage,
});

function AdminNewArticlePage() {
	const navigate = useNavigate();

	const { data: categories = [] } = useQuery({
		queryKey: ["categories"],
		queryFn: getCategories,
	});
	const { data: tags = [] } = useQuery({
		queryKey: ["tags"],
		queryFn: getTags,
	});

	const [title, setTitle] = useState("");
	const [summary, setSummary] = useState("");
	const [content, setContent] = useState("");

	const [categoryId, setCategoryId] = useState<number | "none">("none");
	const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
	const [coverImage, setCoverImage] = useState("");
	const [isTop, setIsTop] = useState(false);

	const [seoTitle, setSeoTitle] = useState("");
	const [seoDescription, setSeoDescription] = useState("");
	const [seoKeywords, setSeoKeywords] = useState("");
	const [ogImage, setOgImage] = useState("");

	const [inlineImageUrl, setInlineImageUrl] = useState("");
	const [inlineImageAlt, setInlineImageAlt] = useState("");

	const [uploadingCover, setUploadingCover] = useState(false);
	const [uploadingInline, setUploadingInline] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);

	const editorRef = useRef<HTMLTextAreaElement | null>(null);

	const insertMarkdownImage = (url: string, alt: string) => {
		const cleanedUrl = url.trim();
		if (!cleanedUrl) return;

		const markdown = `![${alt || "image"}](${cleanedUrl})`;
		const textarea = editorRef.current;

		if (!textarea) {
			setContent(
				(prev) => `${prev}${prev.endsWith("\n") ? "" : "\n"}${markdown}\n`,
			);
			return;
		}

		const start = textarea.selectionStart ?? content.length;
		const end = textarea.selectionEnd ?? start;
		const next = `${content.slice(0, start)}${markdown}${content.slice(end)}`;
		setContent(next);

		requestAnimationFrame(() => {
			textarea.focus();
			const cursor = start + markdown.length;
			textarea.setSelectionRange(cursor, cursor);
		});
	};

	const mutation = useMutation({
		mutationFn: async () => {
			const created = await createArticle({
				title: title.trim(),
				summary: summary.trim() ? summary.trim() : null,
				content,
				is_published: false,
				category_id: categoryId === "none" ? null : categoryId,
				cover_image: coverImage.trim() ? coverImage.trim() : null,
				is_top: isTop,
			});

			await setArticleTags(created.id, selectedTagIds);

			const metaPayloads = [
				seoTitle.trim()
					? {
							name: "title",
							property: null,
							content: seoTitle.trim(),
							resource_type: "article",
							resource_id: created.id,
						}
					: null,
				seoDescription.trim()
					? {
							name: "description",
							property: null,
							content: seoDescription.trim(),
							resource_type: "article",
							resource_id: created.id,
						}
					: null,
				seoKeywords.trim()
					? {
							name: "keywords",
							property: null,
							content: seoKeywords.trim(),
							resource_type: "article",
							resource_id: created.id,
						}
					: null,
				ogImage.trim()
					? {
							name: null,
							property: "og:image",
							content: ogImage.trim(),
							resource_type: "article",
							resource_id: created.id,
						}
					: null,
			].filter(Boolean) as Array<Parameters<typeof createMeta>[0]>;

			if (metaPayloads.length) {
				await Promise.all(metaPayloads.map((p) => createMeta(p)));
			}

			return created;
		},
		onSuccess: (created) => {
			navigate({
				to: "/admin/articles/$id",
				params: { id: String(created.id) },
			});
		},
	});

	return (
		<div className="space-y-8">
			<AdminPageHeader
				title="New Article"
				description="Write a draft, then publish when ready."
				actions={
					<>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => navigate({ to: "/admin/articles" })}
						>
							Cancel
						</Button>
						<Button
							type="button"
							size="sm"
							onClick={() => mutation.mutate()}
							disabled={mutation.isPending || !title.trim()}
						>
							<Save className="h-4 w-4" />
							{mutation.isPending ? "Saving..." : "Save"}
						</Button>
					</>
				}
			/>

			<div className="grid gap-6 lg:grid-cols-[1fr_360px]">
				<AdminSurface innerClassName="p-6">
					<div className="space-y-6">
						<div className="space-y-3">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								required
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="A great title..."
							/>
						</div>

						<div className="space-y-3">
							<Label htmlFor="summary">Summary</Label>
							<Input
								id="summary"
								value={summary}
								onChange={(e) => setSummary(e.target.value)}
								placeholder="Short description for list pages..."
							/>
						</div>

						<div className="space-y-3">
							<Label htmlFor="content">Content (Markdown)</Label>
							<MarkdownEditor
								id="content"
								value={content}
								onChange={setContent}
								placeholder="# Hello world"
								heightClassName="h-[720px]"
								textareaRef={editorRef}
							/>
						</div>

						{mutation.isError ? (
							<div className="text-sm text-destructive">
								{mutation.error instanceof Error
									? mutation.error.message
									: "Create failed"}
							</div>
						) : null}
					</div>
				</AdminSurface>

				<div className="space-y-6">
					<AdminSurface innerClassName="p-6">
						<div className="space-y-5">
							<div className="text-sm font-medium">Metadata</div>

							<div className="space-y-3">
								<Label htmlFor="category">Category</Label>
								<SelectMenu
									value={categoryId === "none" ? "none" : String(categoryId)}
									onValueChange={(v) =>
										setCategoryId(v === "none" ? "none" : Number(v))
									}
									options={[
										{ value: "none", label: "None" },
										...categories.map((c) => ({
											value: String(c.id),
											label: `${c.emoji ? `${c.emoji} ` : ""}${c.name}`,
											keywords: c.name,
										})),
									]}
									placeholder="None"
									searchPlaceholder="Search categories..."
									emptyText="No categories."
								/>
							</div>

							<div className="space-y-3">
								<Label>Tags</Label>
								<TagMultiSelect
									tags={tags}
									selectedTagIds={selectedTagIds}
									onChange={setSelectedTagIds}
									placeholder="Select tags..."
								/>
							</div>

							<div className="space-y-3">
								<Label htmlFor="cover-image">Cover image</Label>
								<div className="flex items-center gap-2">
									<Input
										id="cover-image"
										type="url"
										value={coverImage}
										onChange={(e) => setCoverImage(e.target.value)}
										placeholder="https://..."
									/>
									<input
										type="file"
										accept="image/*"
										className="hidden"
										id="cover-image-upload"
										onChange={async (e) => {
											const file = e.target.files?.[0];
											e.target.value = "";
											if (!file) return;
											setUploadError(null);
											setUploadingCover(true);
											try {
												const res = await uploadImage(file);
												setCoverImage(res.url);
											} catch (err) {
												setUploadError(
													err instanceof Error ? err.message : "Upload failed",
												);
											} finally {
												setUploadingCover(false);
											}
										}}
									/>
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={uploadingCover}
										onClick={() =>
											document.getElementById("cover-image-upload")?.click()
										}
									>
										<ImageUp className="h-4 w-4" />
										{uploadingCover ? "Uploading..." : "Upload"}
									</Button>
								</div>
								{coverImage.trim() ? (
									<div className="overflow-hidden rounded-lg border border-border bg-muted/20">
										<img
											src={coverImage.trim()}
											alt="Cover preview"
											className="aspect-[16/9] w-full object-cover"
										/>
									</div>
								) : null}
							</div>

							<div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/20 p-3">
								<div className="space-y-0.5">
									<div className="text-sm font-medium">Pin / Top</div>
									<div className="text-xs text-muted-foreground">
										Keep this article at the top of lists.
									</div>
								</div>
								<Switch checked={isTop} onCheckedChange={setIsTop} />
							</div>

							{uploadError ? (
								<div className="text-sm text-destructive">{uploadError}</div>
							) : null}
						</div>
					</AdminSurface>

					<AdminSurface innerClassName="p-6">
						<div className="space-y-5">
							<div className="text-sm font-medium">SEO</div>

							<div className="space-y-3">
								<Label htmlFor="seo-title">Meta title</Label>
								<Input
									id="seo-title"
									value={seoTitle}
									onChange={(e) => setSeoTitle(e.target.value)}
									placeholder="Optional"
								/>
							</div>

							<div className="space-y-3">
								<Label htmlFor="seo-description">Meta description</Label>
								<Textarea
									id="seo-description"
									value={seoDescription}
									onChange={(e) => setSeoDescription(e.target.value)}
									placeholder="Optional"
									className="min-h-[96px]"
								/>
							</div>

							<div className="space-y-3">
								<Label htmlFor="seo-keywords">Meta keywords</Label>
								<Input
									id="seo-keywords"
									value={seoKeywords}
									onChange={(e) => setSeoKeywords(e.target.value)}
									placeholder="e.g. react, hono, supabase"
								/>
							</div>

							<div className="space-y-3">
								<Label htmlFor="og-image">OG image (og:image)</Label>
								<Input
									id="og-image"
									type="url"
									value={ogImage}
									onChange={(e) => setOgImage(e.target.value)}
									placeholder="https://..."
								/>
							</div>
						</div>
					</AdminSurface>

					<AdminSurface innerClassName="p-6">
						<div className="space-y-5">
							<div className="text-sm font-medium">Insert Image</div>

							<div className="space-y-3">
								<Label htmlFor="inline-image-url">Image URL</Label>
								<div className="flex items-center gap-2">
									<Input
										id="inline-image-url"
										type="url"
										value={inlineImageUrl}
										onChange={(e) => setInlineImageUrl(e.target.value)}
										placeholder="https://..."
									/>
									<Button
										type="button"
										variant="secondary"
										size="sm"
										disabled={!inlineImageUrl.trim()}
										onClick={() =>
											insertMarkdownImage(inlineImageUrl, inlineImageAlt.trim())
										}
									>
										Insert
									</Button>
								</div>
							</div>

							<div className="space-y-3">
								<Label htmlFor="inline-image-alt">Alt text</Label>
								<Input
									id="inline-image-alt"
									value={inlineImageAlt}
									onChange={(e) => setInlineImageAlt(e.target.value)}
									placeholder="image"
								/>
							</div>

							<div className="space-y-3">
								<Label>Upload image</Label>
								<input
									type="file"
									accept="image/*"
									className="hidden"
									id="inline-image-upload"
									onChange={async (e) => {
										const file = e.target.files?.[0];
										e.target.value = "";
										if (!file) return;
										setUploadError(null);
										setUploadingInline(true);
										try {
											const res = await uploadImage(file);
											insertMarkdownImage(
												res.url,
												inlineImageAlt.trim() || file.name,
											);
										} catch (err) {
											setUploadError(
												err instanceof Error ? err.message : "Upload failed",
											);
										} finally {
											setUploadingInline(false);
										}
									}}
								/>
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={uploadingInline}
									onClick={() =>
										document.getElementById("inline-image-upload")?.click()
									}
								>
									<ImageUp className="h-4 w-4" />
									{uploadingInline ? "Uploading..." : "Upload & Insert"}
								</Button>
							</div>
						</div>
					</AdminSurface>

					<AdminSurface innerClassName="p-6">
						<div className="flex items-start gap-3">
							<div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary ring-1 ring-primary/20">
								<Info className="h-4 w-4" />
							</div>
							<div className="space-y-1">
								<div className="text-sm font-medium">Tips</div>
								<ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
									<li>Use headings and code blocks for readability.</li>
									<li>Keep summaries short: 1-2 sentences.</li>
									<li>Save often; publishing is a separate action.</li>
								</ul>
							</div>
						</div>
					</AdminSurface>
				</div>
			</div>
		</div>
	);
}
