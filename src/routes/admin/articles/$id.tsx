import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ImageUp, Info, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminPageHeader, AdminSurface } from "@/components/admin/AdminLayout";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { MetaEditor, type MetaDraft } from "@/components/admin/MetaEditor";
import { TagMultiSelect } from "@/components/admin/TagMultiSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectMenu } from "@/components/ui/select-menu";
import { Switch } from "@/components/ui/switch";
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

	const [metaDrafts, setMetaDrafts] = useState<MetaDraft[]>([]);
	const [metaInitialized, setMetaInitialized] = useState(false);

	const [uploadingCover, setUploadingCover] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);

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
		setMetaDrafts(
			items.map((m) => ({
				id: m.id,
				name: m.name ?? "",
				property: m.property ?? "",
				content: m.content ?? "",
			})),
		);
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

			const draftIds = new Set(
				metaDrafts
					.map((m) => m.id)
					.filter((id): id is number => typeof id === "number"),
			);

			for (const m of existing) {
				if (!draftIds.has(m.id)) ops.push(deleteMeta(m.id));
			}

			for (const draft of metaDrafts) {
				const cleanedName = draft.name.trim() ? draft.name.trim() : null;
				const cleanedProperty = draft.property.trim()
					? draft.property.trim()
					: null;
				const cleanedContent = draft.content.trim()
					? draft.content.trim()
					: null;
				const hasKey = Boolean(cleanedName || cleanedProperty);
				const hasContent = Boolean(cleanedContent);

				if (draft.id) {
					if (!hasKey || !hasContent) {
						ops.push(deleteMeta(draft.id));
						continue;
					}
					ops.push(
						updateMeta(draft.id, {
							name: cleanedName,
							property: cleanedProperty,
							content: cleanedContent,
						}),
					);
					continue;
				}

				if (hasKey && hasContent) {
					ops.push(
						createMeta({
							name: cleanedName,
							property: cleanedProperty,
							content: cleanedContent,
							resource_type: "article",
							resource_id: articleId,
						}),
					);
				}
			}

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
					<div className="space-y-8">
						{isPending ? (
							<div className="text-sm text-muted-foreground">Loading...</div>
						) : error ? (
							<div className="text-sm text-destructive">
								{error instanceof Error ? error.message : "Load failed"}
							</div>
						) : null}

						<div className="flex flex-col gap-4">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								required
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>
						</div>

						<div className="flex flex-col gap-4">
							<Label htmlFor="summary">Summary</Label>
							<Input
								id="summary"
								value={summary}
								onChange={(e) => setSummary(e.target.value)}
							/>
						</div>

						<div className="flex flex-col gap-4">
							<Label htmlFor="content">Content (Markdown)</Label>
							<MarkdownEditor
								id="content"
								value={content}
								onChange={setContent}
								placeholder="# Hello world"
								heightClassName="h-[720px]"
								onUploadImage={uploadImage}
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
						<div className="space-y-6">
							<div className="text-sm font-medium">Metadata</div>

							<div className="flex flex-col gap-4">
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

							<div className="flex flex-col gap-4">
								<Label>Tags</Label>
								<TagMultiSelect
									tags={tags}
									selectedTagIds={selectedTagIds}
									onChange={setSelectedTagIds}
									placeholder="Select tags..."
								/>
							</div>

							<div className="flex flex-col gap-4">
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
						<div className="space-y-6">
							<div className="text-sm font-medium">Meta</div>
							<MetaEditor
								value={metaDrafts}
								onChange={setMetaDrafts}
								disabled={!data}
							/>
							{metaQuery.isError ? (
								<div className="text-sm text-destructive">
									{metaQuery.error instanceof Error
										? metaQuery.error.message
										: "Meta load failed"}
								</div>
							) : null}
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
