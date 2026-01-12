import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminPageHeader, AdminSurface } from "@/components/admin/AdminLayout";
import { Button, buttonClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";

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
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
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

	const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
	const safePage = Math.min(page, maxPage);
	const paged = useMemo(
		() => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
		[filtered, safePage],
	);

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

			<AdminSurface innerClassName="p-6 space-y-4">
				<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<Input
						placeholder="Search categories..."
						value={search}
						onChange={(event) => {
							setSearch(event.target.value);
							setPage(1);
						}}
						className="w-full md:w-64"
					/>
					<div className="text-sm text-muted-foreground">
						Total: {filtered.length} categories
					</div>
				</div>

				<div className="space-y-3">
					<div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
						<div>
							<span className="font-medium text-foreground">
								Total: {filtered.length}
							</span>{" "}
							<span aria-hidden>|</span>{" "}
							<span className="font-medium text-foreground">
								Page {safePage}/{maxPage}
							</span>
						</div>
						<div className="space-x-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={safePage === 1}
								onClick={() => setPage((prev) => Math.max(1, prev - 1))}
							>
								Prev
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={safePage === maxPage}
								onClick={() => setPage((prev) => Math.min(maxPage, prev + 1))}
							>
								Next
							</Button>
						</div>
					</div>
					<div className="rounded-lg border border-border">
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
											<span className="text-2xl">{cat.emoji ?? "—"}</span>
										</TableCell>
										<TableCell>
											<div className="font-medium">{cat.name}</div>
											<div className="text-xs text-muted-foreground">#{cat.id}</div>
										</TableCell>
										<TableCell className="hidden md:table-cell text-sm text-muted-foreground">
											{cat.description ?? "—"}
										</TableCell>
										<TableCell className="text-right space-x-2">
											<button
												type="button"
												className={buttonClassName({ variant: "outline", size: "sm" })}
												onClick={() => openDialogForEdit(cat)}
											>
												Edit
											</button>
											<button
												type="button"
												className={cn(
													buttonClassName({ variant: "ghost", size: "sm" }),
													"text-destructive",
												)}
												onClick={() => deleteMutation.mutate(cat.id)}
												disabled={deleteMutation.isPending}
											>
												Delete
											</button>
										</TableCell>
									</TableRow>
								))}
								{paged.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={4}
											className="py-8 text-center text-sm text-muted-foreground"
										>
											{listQuery.isPending ? "Loading..." : "No categories match your filters."}
										</TableCell>
									</TableRow>
								) : null}
							</TableBody>
						</Table>
					</div>
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
