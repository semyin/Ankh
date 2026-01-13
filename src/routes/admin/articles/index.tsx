import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, EyeOff, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminPageHeader, AdminSurface } from "@/components/admin/AdminLayout";
import { TagMultiSelect } from "@/components/admin/TagMultiSelect";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectMenu } from "@/components/ui/select-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	type AdminArticleListItem,
	deleteArticle,
	getAdminArticles,
	getCategories,
	getTags,
	setArticlePublished,
} from "@/lib/api";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/admin/articles/")({
	component: AdminArticlesPage,
});

const pageSize = 10;

function AdminArticlesPage() {
	const queryClient = useQueryClient();

	const [titleInput, setTitleInput] = useState("");
	const [categoryIdInput, setCategoryIdInput] = useState<number | "all">("all");
	const [selectedTagIdsInput, setSelectedTagIdsInput] = useState<number[]>([]);

	const [title, setTitle] = useState("");
	const [categoryId, setCategoryId] = useState<number | "all">("all");
	const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
	const [pageInput, setPageInput] = useState("1");
	const [page, setPage] = useState(1);

	const setPageAndInput = (nextPage: number) => {
		setPage(nextPage);
		setPageInput(String(nextPage));
	};

	const { data: categories = [] } = useQuery({
		queryKey: ["categories"],
		queryFn: getCategories,
	});
	const { data: tags = [] } = useQuery({
		queryKey: ["tags"],
		queryFn: getTags,
	});

	const isDirty = useMemo(() => {
		const inputTagIds = selectedTagIdsInput.slice().sort((a, b) => a - b);
		const appliedTagIds = selectedTagIds.slice().sort((a, b) => a - b);
		return (
			titleInput.trim() !== title ||
			categoryIdInput !== categoryId ||
			inputTagIds.join(",") !== appliedTagIds.join(",")
		);
	}, [
		categoryId,
		categoryIdInput,
		selectedTagIds,
		selectedTagIdsInput,
		title,
		titleInput,
	]);

	const canClear = useMemo(() => {
		return (
			titleInput.trim().length > 0 ||
			categoryIdInput !== "all" ||
			selectedTagIdsInput.length > 0
		);
	}, [categoryIdInput, selectedTagIdsInput.length, titleInput]);

	const applyFilters = () => {
		setTitle(titleInput.trim());
		setCategoryId(categoryIdInput);
		setSelectedTagIds(selectedTagIdsInput);
		setPageAndInput(1);
	};

	const clearFilters = () => {
		setTitleInput("");
		setCategoryIdInput("all");
		setSelectedTagIdsInput([]);

		setTitle("");
		setCategoryId("all");
		setSelectedTagIds([]);

		setPageAndInput(1);
	};

	const queryKey = useMemo(
		() => [
			"admin-articles",
			{
				title: title,
				categoryId,
				tagIds: selectedTagIds.slice().sort((a, b) => a - b),
				page,
				pageSize,
			},
		],
		[titleInput, categoryId, selectedTagIds, page],
	);

	const { data, isPending, error } = useQuery({
		queryKey,
		queryFn: () =>
			getAdminArticles({
				title: title.trim() || undefined,
				category_id: categoryId === "all" ? undefined : categoryId,
				tag_ids: selectedTagIds.length ? selectedTagIds : undefined,
				page,
				pageSize,
			}),
	});

	const publishMutation = useMutation({
		mutationFn: ({ id, next }: { id: number; next: boolean }) =>
			setArticlePublished(id, next),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) => deleteArticle(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
		},
	});

	const total = data?.count ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const items = data?.items ?? [];

	const onGoToPage = () => {
		const parsed = Number(pageInput);
		if (!Number.isFinite(parsed)) return;
		const next = Math.max(1, Math.min(totalPages, Math.trunc(parsed)));
		setPageAndInput(next);
	};

	return (
		<div className="space-y-8">
			<AdminPageHeader
				title="Articles"
				description="Filter by category and tags, then manage publish state."
				actions={
					<Link
						to="/admin/articles/new"
						className={buttonClassName({ size: "sm" })}
					>
						<Plus className="h-4 w-4" />
						New
					</Link>
				}
			/>

			<AdminSurface innerClassName="p-6">
				<div className="space-y-6">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="text-sm font-medium">Filters</div>
						<div className="flex flex-wrap items-center justify-end gap-2">
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={applyFilters}
								disabled={!isDirty}
							>
								<Search className="h-4 w-4" />
								Search
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={clearFilters}
								disabled={!canClear}
							>
								<X className="h-4 w-4" />
								Clear
							</Button>
						</div>
					</div>

					<div className="grid gap-6 lg:grid-cols-3">
						<div className="flex flex-col gap-5">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								value={titleInput}
								onChange={(e) => setTitleInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") applyFilters();
								}}
								placeholder="Search title..."
							/>
						</div>

						<div className="flex flex-col gap-5">
							<Label htmlFor="category">Category</Label>
							<SelectMenu
								value={
									categoryIdInput === "all" ? "all" : String(categoryIdInput)
								}
								onValueChange={(v) => {
									setCategoryIdInput(v === "all" ? "all" : Number(v));
								}}
								options={[
									{ value: "all", label: "All categories" },
									...categories.map((c) => ({
										value: String(c.id),
										label: `${c.emoji ? `${c.emoji} ` : ""}${c.name}`,
										keywords: c.name,
									})),
								]}
								placeholder="All categories"
								searchPlaceholder="Search categories..."
								emptyText="No categories."
							/>
						</div>

						<div className="flex flex-col gap-5">
							<Label>Tags (multi-select)</Label>
							<TagMultiSelect
								tags={tags}
								selectedTagIds={selectedTagIdsInput}
								onChange={setSelectedTagIdsInput}
								placeholder="All tags"
							/>
						</div>
					</div>
				</div>
			</AdminSurface>

			<AdminSurface innerClassName="p-6">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div className="space-y-1">
						<div className="text-sm font-medium">List</div>
						{isPending ? (
							<div className="text-sm text-muted-foreground">Loading...</div>
						) : error ? (
							<div className="text-sm text-destructive">
								{error instanceof Error ? error.message : "Load failed"}
							</div>
						) : null}
					</div>
					<div className="ml-auto flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
						<div className="text-sm text-muted-foreground whitespace-nowrap">
							<span className="font-medium text-foreground">
								Total: {total}
							</span>{" "}
							<span className="text-muted-foreground" aria-hidden>
								|
							</span>{" "}
							<span className="font-medium text-foreground">
								Page {page}/{totalPages}
							</span>
						</div>

						<div className="flex flex-wrap items-center justify-end gap-3">
							<div className="flex items-center gap-2 whitespace-nowrap">
								<Label
									htmlFor="page"
									className="text-xs text-muted-foreground whitespace-nowrap"
								>
									Go to
								</Label>
								<Input
									id="page"
									type="number"
									min={1}
									max={totalPages}
									className="w-20 sm:w-24"
									value={pageInput}
									onChange={(e) => setPageInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") onGoToPage();
									}}
								/>
								<Button
									variant="secondary"
									size="sm"
									type="button"
									onClick={onGoToPage}
								>
									Go
								</Button>
							</div>

							<div className="flex items-center gap-2 whitespace-nowrap">
								<Button
									variant="outline"
									size="sm"
									disabled={page <= 1}
									onClick={() => setPageAndInput(Math.max(1, page - 1))}
								>
									Prev
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={page >= totalPages}
									onClick={() =>
										setPageAndInput(Math.min(totalPages, page + 1))
									}
								>
									Next
								</Button>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-5 overflow-hidden rounded-lg border border-border bg-background">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Title</TableHead>
								<TableHead className="hidden lg:table-cell">Category</TableHead>
								<TableHead className="hidden lg:table-cell">Tags</TableHead>
								<TableHead className="hidden lg:table-cell">Created</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="py-10 text-center text-muted-foreground"
									>
										No articles.
									</TableCell>
								</TableRow>
							) : (
								items.map((a) => <ArticleRow key={a.id} article={a} />)
							)}
						</TableBody>
					</Table>
				</div>

				{publishMutation.isError ? (
					<div className="mt-4 text-sm text-destructive">
						{publishMutation.error instanceof Error
							? publishMutation.error.message
							: "Publish update failed"}
					</div>
				) : null}
				{deleteMutation.isError ? (
					<div className="mt-4 text-sm text-destructive">
						{deleteMutation.error instanceof Error
							? deleteMutation.error.message
							: "Delete failed"}
					</div>
				) : null}
			</AdminSurface>
		</div>
	);

	function ArticleRow({ article }: { article: AdminArticleListItem }) {
		return (
			<TableRow>
				<TableCell>
					<div className="font-medium">{article.title}</div>
					<div className="text-xs text-muted-foreground">#{article.id}</div>
					<div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground lg:hidden">
						{article.category ? (
							<span className="rounded-md border border-border bg-muted/30 px-2 py-0.5">
								{article.category.emoji ? `${article.category.emoji} ` : ""}
								{article.category.name}
							</span>
						) : null}
						{article.tags?.length
							? article.tags.slice(0, 2).map((t) => (
									<span
										key={t.id}
										className="rounded-md border border-border bg-muted/30 px-2 py-0.5"
									>
										{t.name}
									</span>
								))
							: null}
						{article.tags && article.tags.length > 2 ? (
							<span className="rounded-md border border-border bg-muted/30 px-2 py-0.5">
								+{article.tags.length - 2}
							</span>
						) : null}
					</div>
				</TableCell>
				<TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
					{article.category ? (
						<div className="text-foreground">
							{article.category.emoji ? `${article.category.emoji} ` : ""}
							{article.category.name}
						</div>
					) : (
						<span className="text-muted-foreground">-</span>
					)}
				</TableCell>
				<TableCell className="hidden lg:table-cell">
					<div className="flex flex-wrap gap-1.5">
						{article.tags?.length ? (
							article.tags.slice(0, 3).map((t) => (
								<Badge key={t.id} variant="secondary">
									{t.name}
								</Badge>
							))
						) : (
							<span className="text-sm text-muted-foreground">-</span>
						)}
						{article.tags && article.tags.length > 3 ? (
							<Badge variant="outline">+{article.tags.length - 3}</Badge>
						) : null}
					</div>
				</TableCell>
				<TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
					{formatDateTime(article.created_at)}
				</TableCell>
				<TableCell>
					{article.is_published ? (
						<Badge>Published</Badge>
					) : (
						<Badge variant="secondary">Draft</Badge>
					)}
				</TableCell>
				<TableCell className="text-right">
					<div className="hidden justify-end gap-2 sm:flex">
						<Link
							to="/admin/articles/$id"
							params={{ id: String(article.id) }}
							className={buttonClassName({ variant: "outline", size: "sm" })}
						>
							<Pencil className="h-4 w-4" />
							Edit
						</Link>
						<Button
							variant="secondary"
							size="sm"
							disabled={publishMutation.isPending}
							onClick={() =>
								publishMutation.mutate({
									id: article.id,
									next: !article.is_published,
								})
							}
						>
							{article.is_published ? "Unpublish" : "Publish"}
						</Button>
						<Button
							variant="destructive"
							size="sm"
							disabled={deleteMutation.isPending}
							onClick={() => {
								if (!confirm(`Delete article #${article.id}?`)) return;
								deleteMutation.mutate(article.id);
							}}
						>
							<Trash2 className="h-4 w-4" />
							Delete
						</Button>
					</div>

					<div className="flex justify-end gap-2 sm:hidden">
						<Link
							to="/admin/articles/$id"
							params={{ id: String(article.id) }}
							className={buttonClassName({ variant: "outline", size: "icon" })}
							aria-label="Edit"
						>
							<Pencil className="h-4 w-4" />
						</Link>
						<Button
							variant="secondary"
							size="icon"
							disabled={publishMutation.isPending}
							onClick={() =>
								publishMutation.mutate({
									id: article.id,
									next: !article.is_published,
								})
							}
							aria-label={article.is_published ? "Unpublish" : "Publish"}
						>
							{article.is_published ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</Button>
						<Button
							variant="destructive"
							size="icon"
							disabled={deleteMutation.isPending}
							onClick={() => {
								if (!confirm(`Delete article #${article.id}?`)) return;
								deleteMutation.mutate(article.id);
							}}
							aria-label="Delete"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</TableCell>
			</TableRow>
		);
	}
}
