import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ImageUp, Info, Save } from "lucide-react";
import { useState } from "react";
import { AdminPageHeader, AdminSurface } from "@/components/admin/AdminLayout";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { MetaEditor, type MetaDraft } from "@/components/admin/MetaEditor";
import { TagMultiSelect } from "@/components/admin/TagMultiSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectMenu } from "@/components/ui/select-menu";
import { Switch } from "@/components/ui/switch";
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

	const [uploadingCover, setUploadingCover] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [metaDrafts, setMetaDrafts] = useState<MetaDraft[]>([]);

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

			const metaPayloads = metaDrafts
				.map((m) => ({
					name: m.name.trim() ? m.name.trim() : null,
					property: m.property.trim() ? m.property.trim() : null,
					content: m.content.trim() ? m.content.trim() : null,
					resource_type: "article",
					resource_id: created.id,
				}))
				.filter((m) => m.content && (m.name || m.property)) as Array<
				Parameters<typeof createMeta>[0]
			>;

			if (metaPayloads.length) await Promise.all(metaPayloads.map(createMeta));

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
					<div className="space-y-8">
						<div className="flex flex-col gap-4">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								required
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="A great title..."
							/>
						</div>

						<div className="flex flex-col gap-4">
							<Label htmlFor="summary">Summary</Label>
							<Input
								id="summary"
								value={summary}
								onChange={(e) => setSummary(e.target.value)}
								placeholder="Short description for list pages..."
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
						<div className="space-y-6">
							<div className="text-sm font-medium">Meta</div>
							<MetaEditor value={metaDrafts} onChange={setMetaDrafts} />
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
