import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminPageHeader, AdminSurface } from "@/components/admin/AdminLayout";
import { Button, buttonClassName } from "@/components/ui/button";
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
import {
	Tag,
	createTag,
	deleteTag,
	getTags,
	updateTag,
} from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/tags")({
	component: TagsAdminPage,
});

type FormState = {
	name: string;
	img_url: string;
};

const emptyForm: FormState = {
	name: "",
	img_url: "",
};

const pageSize = 12;

function TagsAdminPage() {
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [pageInput, setPageInput] = useState("1");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<Tag | null>(null);
	const [form, setForm] = useState<FormState>(emptyForm);

	const listQuery = useQuery({
		queryKey: ["admin-tags"],
		queryFn: getTags,
	});

	const tags = listQuery.data ?? [];

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return tags;
		return tags.filter((tag) => tag.name.toLowerCase().includes(q));
	}, [tags, search]);

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

	const openCreateDialog = () => {
		setEditing(null);
		setForm(emptyForm);
		setDialogOpen(true);
	};

	const openEditDialog = (tag: Tag) => {
		setEditing(tag);
		setForm({
			name: tag.name,
			img_url: tag.img_url ?? "",
		});
		setDialogOpen(true);
	};

	const closeDialog = () => {
		setDialogOpen(false);
		setEditing(null);
		setForm(emptyForm);
	};

	const createMutation = useMutation({
		mutationFn: createTag,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
			closeDialog();
		},
	});

	const updateMutation = useMutation({
		mutationFn: (payload: { id: number; body: FormState }) =>
			updateTag(payload.id, { name: payload.body.name, img_url: payload.body.img_url || null }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
			closeDialog();
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteTag,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
		},
	});

	const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const payload = {
			name: form.name.trim(),
			img_url: form.img_url.trim(),
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

	const onGoToPage = () => {
		const parsed = Number(pageInput);
		if (!Number.isFinite(parsed)) return;
		const next = Math.max(1, Math.min(totalPages, Math.trunc(parsed)));
		setPageAndInput(next);
	};

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Tags"
				description="Fine-grained topics for articles."
				actions={
					<Button type="button" size="sm" onClick={openCreateDialog}>
						New Tag
					</Button>
				}
			/>

			<AdminSurface innerClassName="p-6">
				<div className="space-y-6">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="text-sm font-medium">Filters</div>
						<div className="text-sm text-muted-foreground">
							Search tags by name.
						</div>
					</div>
					<div className="grid gap-6 sm:grid-cols-2">
						<Input
							placeholder="Search tags..."
							value={search}
							onChange={(event) => {
								setSearch(event.target.value);
								setPageAndInput(1);
							}}
						/>
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
									htmlFor="tags-page"
									className="text-xs text-muted-foreground whitespace-nowrap"
								>
									Go to
								</Label>
								<Input
									id="tags-page"
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
									Previous
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
								<TableHead className="w-[90px]">Avatar</TableHead>
								<TableHead>Name</TableHead>
								<TableHead className="hidden md:table-cell">Usage</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paged.map((tag) => (
								<TableRow key={tag.id}>
									<TableCell>
										<div className="h-12 w-12 overflow-hidden rounded-full bg-muted flex items-center justify-center">
											{tag.img_url ? (
												<img
													src={tag.img_url}
													alt={tag.name}
													className="h-full w-full object-cover"
												/>
											) : (
												<span className="text-xs font-semibold">
													{tag.name.slice(0, 2).toUpperCase()}
												</span>
											)}
										</div>
									</TableCell>
									<TableCell>
										<div className="font-medium">{tag.name}</div>
										<div className="text-xs text-muted-foreground">#{tag.id}</div>
									</TableCell>
									<TableCell className="hidden md:table-cell text-sm text-muted-foreground">
										{tag.usage_count ?? 0}
									</TableCell>
									<TableCell className="text-right space-x-2">
										<button
											type="button"
											className={buttonClassName({ variant: "outline", size: "sm" })}
											onClick={() => openEditDialog(tag)}
										>
											Edit
										</button>
										<button
											type="button"
											className={cn(
												buttonClassName({ variant: "ghost", size: "sm" }),
												"text-destructive",
											)}
											onClick={() => deleteMutation.mutate(tag.id)}
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
										{listQuery.isPending ? "Loading..." : "No tags match your filters."}
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
								{editing ? "Edit Tag" : "New Tag"}
							</h3>
							<p className="text-sm text-muted-foreground">
								Tags help readers explore related content.
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
							<label className="text-sm font-medium">Image URL</label>
							<Input
								value={form.img_url}
								onChange={(event) =>
									setForm((prev) => ({ ...prev, img_url: event.target.value }))
								}
								placeholder="https://..."
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
