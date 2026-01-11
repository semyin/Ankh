import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ImageUp, Info, Save } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminPageHeader, AdminSurface } from "@/components/admin/AdminLayout";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { TagMultiSelect } from "@/components/admin/TagMultiSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectMenu } from "@/components/ui/select-menu";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	createMeta,
	deleteMeta,
	getAdminArticle,
	getCategories,
	getMeta,
	getTags,
	setArticlePublished,
	setArticleTags,
	updateMeta,
	updateArticle,
	uploadImage,
} from "@/lib/api";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/admin/articles/$id")({
	component: AdminEditArticlePage,
});

function AdminEditArticlePage() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { id } = Route.useParams();
	const articleId = Number(id);

	const editorRef = useRef<HTMLTextAreaElement | null>(null);

	const { data: categories = [] } = useQuery({
		queryKey: ["categories"],
		queryFn: getCategories,
	});
	const { data: tags = [] } = useQuery({
		queryKey: ["tags"],
		queryFn: getTags,
	});

	const { data, isPending, error } = useQuery({
		queryKey: ["admin-article", articleId],
		queryFn: () => getAdminArticle(articleId),
		enabled: Number.isFinite(articleId),
	});

	const metaQuery = useQuery({
		queryKey: ["meta", "article", articleId],
		queryFn: () =>
			getMeta({ resource_type: "article", resource_id: articleId }),
		enabled: Number.isFinite(articleId),
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
	const [metaInitialized, setMetaInitialized] = useState(false);

	const [inlineImageUrl, setInlineImageUrl] = useState("");
	const [inlineImageAlt, setInlineImageAlt] = useState("");

	const [uploadingCover, setUploadingCover] = useState(false);
	const [uploadingInline, setUploadingInline] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);

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

	useEffect(() => {
		if (!data) return;
		setTitle(data.title ?? "");
		setSummary(data.summary ?? "");
		setContent(data.content ?? "");
		setCoverImage(data.cover_image ?? "");
		setIsTop(Boolean(data.is_top));
		setCategoryId(data.category?.id ?? "none");
		setSelectedTagIds((data.tags ?? []).map((t) => t.id));
	}, [data]);

	useEffect(() => {
		if (metaInitialized) return;
		if (!metaQuery.isSuccess) return;

		const items = metaQuery.data ?? [];
		const byName = (name: string) =>
			items.find((m) => m.name === name)?.content ?? "";
		const byProperty = (property: string) =>
			items.find((m) => m.property === property)?.content ?? "";

		setSeoTitle(byName("title"));
		setSeoDescription(byName("description"));
		setSeoKeywords(byName("keywords"));
		setOgImage(byProperty("og:image"));
		setMetaInitialized(true);
	}, [metaInitialized, metaQuery.data, metaQuery.isSuccess]);

	const isPublished = data?.is_published ?? false;
	const updatedLabel = useMemo(() => {
		if (!data) return `#${articleId}`;
		return `#${articleId} - Updated ${formatDateTime(data.updated_at)}`;
	}, [articleId, data]);

	const saveMutation = useMutation({
		mutationFn: async () => {
			const updated = await updateArticle(articleId, {
				title: title.trim(),
				summary: summary.trim() ? summary.trim() : null,
				content,
				category_id: categoryId === "none" ? null : categoryId,
				cover_image: coverImage.trim() ? coverImage.trim() : null,
				is_top: isTop,
			});

			await setArticleTags(articleId, selectedTagIds);

			const existing = metaQuery.data ?? [];
			const ops: Array<Promise<unknown>> = [];

			const sync = ({
				kind,
				key,
				value,
			}: {
				kind: "name" | "property";
				key: string;
				value: string;
			}) => {
				const cleaned = value.trim();
				const found =
					kind === "name"
						? existing.find((m) => m.name === key)
						: existing.find((m) => m.property === key);

				if (!cleaned) {
					if (found) ops.push(deleteMeta(found.id));
					return;
				}

				if (found) {
					ops.push(updateMeta(found.id, { content: cleaned }));
					return;
				}

				ops.push(
					createMeta({
						name: kind === "name" ? key : null,
						property: kind === "property" ? key : null,
						content: cleaned,
						resource_type: "article",
						resource_id: articleId,
					}),
				);
			};

			sync({ kind: "name", key: "title", value: seoTitle });
			sync({ kind: "name", key: "description", value: seoDescription });
			sync({ kind: "name", key: "keywords", value: seoKeywords });
			sync({ kind: "property", key: "og:image", value: ogImage });

			if (ops.length) await Promise.all(ops);

			return updated;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["admin-article", articleId],
			});
			await queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
			await queryClient.invalidateQueries({
				queryKey: ["meta", "article", articleId],
			});
		},
	});

	const publishMutation = useMutation({
		mutationFn: (next: boolean) => setArticlePublished(articleId, next),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["admin-article", articleId],
			});
			await queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
		},
	});

	if (!Number.isFinite(articleId)) {
		return <div className="text-sm text-destructive">Invalid article id.</div>;
	}

	return (
		<div className="space-y-8">
			<AdminPageHeader
				title="Edit Article"
				description={updatedLabel}
				actions={
					<>
						{data ? (
							<Badge variant={isPublished ? "default" : "secondary"}>
								{isPublished ? "Published" : "Draft"}
							</Badge>
						) : null}
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => navigate({ to: "/admin/articles" })}
						>
							Back
						</Button>
						<Button
							type="button"
							variant="secondary"
							size="sm"
							disabled={!data || publishMutation.isPending}
							onClick={() => publishMutation.mutate(!isPublished)}
						>
							<CheckCircle2 className="h-4 w-4" />
							{isPublished ? "Unpublish" : "Publish"}
						</Button>
						<Button
							type="button"
							size="sm"
							disabled={!title.trim() || saveMutation.isPending}
							onClick={() => saveMutation.mutate()}
						>
							<Save className="h-4 w-4" />
							{saveMutation.isPending ? "Saving..." : "Save"}
						</Button>
					</>
				}
			/>

			<div className="grid gap-6 lg:grid-cols-[1fr_360px]">
				<AdminSurface innerClassName="p-6">
					<div className="space-y-6">
						{isPending ? (
							<div className="text-sm text-muted-foreground">Loading...</div>
						) : error ? (
							<div className="text-sm text-destructive">
								{error instanceof Error ? error.message : "Load failed"}
							</div>
						) : null}

						<div className="space-y-3">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								required
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>
						</div>

						<div className="space-y-3">
							<Label htmlFor="summary">Summary</Label>
							<Input
								id="summary"
								value={summary}
								onChange={(e) => setSummary(e.target.value)}
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

						{saveMutation.isError ? (
							<div className="text-sm text-destructive">
								{saveMutation.error instanceof Error
									? saveMutation.error.message
									: "Save failed"}
							</div>
						) : null}
						{publishMutation.isError ? (
							<div className="text-sm text-destructive">
								{publishMutation.error instanceof Error
									? publishMutation.error.message
									: "Publish update failed"}
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
									disabled={!data}
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
										disabled={!data}
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
										disabled={!data || uploadingCover}
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
								<Switch
									checked={isTop}
									onCheckedChange={setIsTop}
									disabled={!data}
								/>
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
									disabled={!data}
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
									disabled={!data}
								/>
							</div>

							<div className="space-y-3">
								<Label htmlFor="seo-keywords">Meta keywords</Label>
								<Input
									id="seo-keywords"
									value={seoKeywords}
									onChange={(e) => setSeoKeywords(e.target.value)}
									placeholder="e.g. react, hono, supabase"
									disabled={!data}
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
									disabled={!data}
								/>
							</div>

							{metaQuery.isError ? (
								<div className="text-sm text-destructive">
									{metaQuery.error instanceof Error
										? metaQuery.error.message
										: "Meta load failed"}
								</div>
							) : null}
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
										disabled={!data}
									/>
									<Button
										type="button"
										variant="secondary"
										size="sm"
										disabled={!data || !inlineImageUrl.trim()}
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
									disabled={!data}
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
									disabled={!data || uploadingInline}
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

					{data ? (
						<AdminSurface innerClassName="p-6">
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary ring-1 ring-primary/20">
										<Info className="h-4 w-4" />
									</div>
									<div className="space-y-1">
										<div className="text-sm font-medium">Details</div>
										<div className="text-sm text-muted-foreground">
											<div>Created: {formatDateTime(data.created_at)}</div>
											<div>Updated: {formatDateTime(data.updated_at)}</div>
										</div>
									</div>
								</div>
							</div>
						</AdminSurface>
					) : null}
				</div>
			</div>
		</div>
	);
}
