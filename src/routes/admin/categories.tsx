import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Search as SearchIcon, Trash2, X as ClearIcon } from "lucide-react";
import { AdminPageHeader, AdminSurface } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
	Category,
	createCategory,
	deleteCategory,
	getCategories,
	updateCategory,
} from "@/lib/api";

export const Route = createFileRoute("/admin/categories")({
	component: CategoriesAdminPage,
});

type FormState = {
	name: string;
	emoji: string;
	description: string;
};

const emptyForm: FormState = {
	name: "",
	emoji: "",
	description: "",
};

const pageSize = 10;

function CategoriesAdminPage() {
	const queryClient = useQueryClient();
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [pageInput, setPageInput] = useState("1");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<Category | null>(null);
	const [form, setForm] = useState<FormState>(emptyForm);

	const listQuery = useQuery({
		queryKey: ["admin-categories"],
		queryFn: getCategories,
	});

	const categories = listQuery.data ?? [];

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return categories;
		return categories.filter((cat) => cat.name.toLowerCase().includes(q));
	}, [categories, search]);

	const total = filtered.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const currentPage = Math.min(page, totalPages);
	const paged = useMemo(
		() =>
			filtered.slice(
				(currentPage - 1) * pageSize,
				currentPage * pageSize,
			),
		[filtered, currentPage],
	);

	const setPageAndInput = (next: number) => {
		setPage(next);
		setPageInput(String(next));
	};

	useEffect(() => {
		if (page > totalPages) {
			setPage(totalPages);
			setPageInput(String(totalPages));
		}
	}, [page, totalPages]);

	const openDialogForCreate = () => {
		setEditing(null);
		setForm(emptyForm);
		setDialogOpen(true);
	};

	const openDialogForEdit = (cat: Category) => {
		setEditing(cat);
		setForm({
			name: cat.name,
			emoji: cat.emoji ?? "",
			description: cat.description ?? "",
		});
		setDialogOpen(true);
	};

	const closeDialog = () => {
		setDialogOpen(false);
		setEditing(null);
		setForm(emptyForm);
	};

	const createMutation = useMutation({
		mutationFn: createCategory,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
			closeDialog();
		},
	});

	const updateMutation = useMutation({
		mutationFn: (payload: { id: number; body: FormState }) =>
			updateCategory(payload.id, {
				name: payload.body.name,
				emoji: payload.body.emoji || null,
				description: payload.body.description || null,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
			closeDialog();
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteCategory,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
		},
	});

	const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const payload = {
			name: form.name.trim(),
			emoji: form.emoji.trim(),
			description: form.description.trim(),
		};
		if (!payload.name) return;
		if (editing) {
			updateMutation.mutate({ id: editing.id, body: payload });
		} else {
			createMutation.mutate(payload);
		}
	};

	const isMutating =
		createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

	const isDirty = useMemo(() => {
		return searchInput.trim() !== search;
	}, [search, searchInput]);

	const canClear = useMemo(() => {
		return searchInput.trim().length > 0 || search.length > 0;
	}, [search, searchInput]);

	const applyFilters = () => {
		setSearch(searchInput.trim());
		setPageAndInput(1);
	};

	const clearFilters = () => {
		setSearchInput("");
		setSearch("");
		setPageAndInput(1);
	};

	const onGoToPage = () => {
		const parsed = Number(pageInput);
		if (!Number.isFinite(parsed)) return;
		const next = Math.max(1, Math.min(totalPages, Math.trunc(parsed)));
		setPageAndInput(next);
	};

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Categories"
				description="Organize articles by high-level groups."
				actions={
					<Button type="button" size="sm" onClick={openDialogForCreate}>
						New Category
					</Button>
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
								<SearchIcon className="h-4 w-4" />
								Search
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={clearFilters}
								disabled={!canClear}
							>
								<ClearIcon className="h-4 w-4" />
								Clear
							</Button>
						</div>
					</div>
					<div className="grid gap-6 sm:grid-cols-2">
						<div className="flex flex-col gap-5">
							<Label htmlFor="category-search">Search</Label>
							<Input
								id="category-search"
								placeholder="Search categories..."
								value={searchInput}
								onChange={(event) => {
									setSearchInput(event.target.value);
								}}
								onKeyDown={(event) => {
									if (event.key === "Enter") applyFilters();
								}}
							/>
						</div>
					</div>
				</div>
			</AdminSurface>

			<AdminSurface innerClassName="p-6">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div className="space-y-1">
						<div className="text-sm font-medium">List</div>
						{listQuery.isPending ? (
							<div className="text-sm text-muted-foreground">Loading...</div>
						) : listQuery.error ? (
							<div className="text-sm text-destructive">
								{listQuery.error instanceof Error
									? listQuery.error.message
									: "Load failed"}
							</div>
						) : null}
					</div>
					<div className="ml-auto flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
						<div className="text-sm text-muted-foreground whitespace-nowrap">
							<span className="font-medium text-foreground">Total: {total}</span>{" "}
							<span className="text-muted-foreground" aria-hidden>
								|
							</span>{" "}
							<span className="font-medium text-foreground">
								Page {currentPage}/{totalPages}
							</span>
						</div>
						<div className="flex flex-wrap items-center justify-end gap-3">
							<div className="flex items-center gap-2 whitespace-nowrap">
								<Label
									htmlFor="categories-page"
									className="text-xs text-muted-foreground whitespace-nowrap"
								>
									Go to
								</Label>
								<Input
									id="categories-page"
									type="number"
									min={1}
									max={totalPages}
									className="w-20 sm:w-24"
									value={pageInput}
									onChange={(event) => setPageInput(event.target.value)}
									onKeyDown={(event) => {
										if (event.key === "Enter") onGoToPage();
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
									type="button"
									variant="outline"
									size="sm"
									disabled={currentPage === 1}
									onClick={() => setPageAndInput(Math.max(1, currentPage - 1))}
								>
									Prev
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={currentPage === totalPages}
									onClick={() =>
										setPageAndInput(Math.min(totalPages, currentPage + 1))
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
								<TableHead className="w-[80px]">Emoji</TableHead>
								<TableHead>Name</TableHead>
								<TableHead className="hidden md:table-cell">Description</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paged.map((cat) => (
								<TableRow key={cat.id}>
									<TableCell>
										<span className="text-2xl">{cat.emoji ?? "-"}</span>
									</TableCell>
									<TableCell>
										<div className="font-medium">{cat.name}</div>
										<div className="text-xs text-muted-foreground">#{cat.id}</div>
									</TableCell>
									<TableCell className="hidden md:table-cell text-sm text-muted-foreground">
										{cat.description ?? "-"}
									</TableCell>
									<TableCell className="text-right">
										<div className="hidden justify-end gap-2 sm:flex">
											<Button
												variant="outline"
												size="sm"
												type="button"
												onClick={() => openDialogForEdit(cat)}
											>
												<Pencil className="h-4 w-4" />
												Edit
											</Button>
											<Button
												variant="destructive"
												size="sm"
												type="button"
												onClick={() => deleteMutation.mutate(cat.id)}
												disabled={deleteMutation.isPending}
											>
												<Trash2 className="h-4 w-4" />
												Delete
											</Button>
										</div>
										<div className="flex justify-end gap-2 sm:hidden">
											<Button
												variant="outline"
												size="icon"
												type="button"
												onClick={() => openDialogForEdit(cat)}
												aria-label="Edit"
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												variant="destructive"
												size="icon"
												type="button"
												onClick={() => deleteMutation.mutate(cat.id)}
												disabled={deleteMutation.isPending}
												aria-label="Delete"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
							{paged.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={4}
										className="py-8 text-center text-sm text-muted-foreground"
									>
										{listQuery.isPending
											? "Loading..."
											: "No categories match your filters."}
									</TableCell>
								</TableRow>
							) : null}
						</TableBody>
					</Table>
				</div>
			</AdminSurface>

			{dialogOpen ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
					<form
						onSubmit={onSubmit}
						className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl"
					>
						<div>
							<h3 className="text-lg font-semibold">
								{editing ? "Edit Category" : "New Category"}
							</h3>
							<p className="text-sm text-muted-foreground">
								Define how articles are grouped within the blog.
							</p>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Name</label>
							<Input
								required
								value={form.name}
								onChange={(event) =>
									setForm((prev) => ({ ...prev, name: event.target.value }))
								}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Emoji</label>
							<Input
								value={form.emoji}
								maxLength={4}
								onChange={(event) =>
									setForm((prev) => ({ ...prev, emoji: event.target.value }))
								}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Description</label>
							<Textarea
								rows={3}
								value={form.description}
								onChange={(event) =>
									setForm((prev) => ({ ...prev, description: event.target.value }))
								}
							/>
						</div>
						<div className="flex items-center justify-end gap-3">
							<Button type="button" variant="ghost" onClick={closeDialog}>
								Cancel
							</Button>
							<Button type="submit" disabled={isMutating}>
								{editing ? "Save changes" : "Create"}
							</Button>
						</div>
					</form>
				</div>
			) : null}
		</div>
	);
}
