import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
	Pencil,
	Search as SearchIcon,
	Trash2,
	X as ClearIcon,
} from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { SelectMenu } from "@/components/ui/select-menu";
import {
	FriendLink,
	createFriendLink,
	deleteFriendLink,
	getAdminFriendLinks,
	setFriendLinkVisibility,
	updateFriendLink,
} from "@/lib/api";

export const Route = createFileRoute("/admin/links")({
	component: AdminLinksPage,
});

type FormState = {
	name: string;
	url: string;
	avatar_url: string;
	type: string;
	description: string;
	sort_weight: string;
	is_visible: boolean;
};

const emptyForm: FormState = {
	name: "",
	url: "",
	avatar_url: "",
	type: "",
	description: "",
	sort_weight: "0",
	is_visible: true,
};

const pageSize = 10;

function AdminLinksPage() {
	const queryClient = useQueryClient();
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [visibilityFilterInput, setVisibilityFilterInput] = useState<
		"all" | "visible" | "hidden"
	>("all");
	const [visibilityFilter, setVisibilityFilter] = useState<
		"all" | "visible" | "hidden"
	>("all");
	const [page, setPage] = useState(1);
	const [pageInput, setPageInput] = useState("1");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<FriendLink | null>(null);
	const [form, setForm] = useState<FormState>(emptyForm);

	const listQuery = useQuery({
		queryKey: ["admin-friend-links"],
		queryFn: () => getAdminFriendLinks(),
	});

	const links = listQuery.data ?? [];

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return links.filter((link) => {
			const matchesSearch =
				!q ||
				link.name.toLowerCase().includes(q) ||
				(link.description ?? "").toLowerCase().includes(q);
			const matchesVisibility =
				visibilityFilter === "all" ||
				(visibilityFilter === "visible" && link.is_visible) ||
				(visibilityFilter === "hidden" && !link.is_visible);
			return matchesSearch && matchesVisibility;
		});
	}, [links, search, visibilityFilter]);

	const sorted = useMemo(
		() =>
			[...filtered].sort((a, b) => {
				const weightDiff = (b.sort_weight ?? 0) - (a.sort_weight ?? 0);
				if (weightDiff !== 0) return weightDiff;
				return b.created_at.localeCompare(a.created_at);
			}),
		[filtered],
	);

	const total = sorted.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const currentPage = Math.min(page, totalPages);
	const paged = useMemo(
		() => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize),
		[sorted, currentPage],
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

	const openEditDialog = (link: FriendLink) => {
		setEditing(link);
		setForm({
			name: link.name,
			url: link.url,
			avatar_url: link.avatar_url ?? "",
			type: link.type ?? "",
			description: link.description ?? "",
			sort_weight: String(link.sort_weight ?? 0),
			is_visible: link.is_visible,
		});
		setDialogOpen(true);
	};

	const closeDialog = () => {
		setDialogOpen(false);
		setEditing(null);
		setForm(emptyForm);
	};

	const createMutation = useMutation({
		mutationFn: createFriendLink,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-friend-links"] });
			closeDialog();
		},
	});

	const updateMutation = useMutation({
		mutationFn: (payload: { id: number; body: FormState }) =>
			updateFriendLink(payload.id, {
				name: payload.body.name,
				url: payload.body.url,
				avatar_url: payload.body.avatar_url || null,
				type: payload.body.type || null,
				description: payload.body.description || null,
				sort_weight: Number(payload.body.sort_weight) || 0,
				is_visible: payload.body.is_visible,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-friend-links"] });
			closeDialog();
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteFriendLink,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-friend-links"] });
		},
	});

	const visibilityMutation = useMutation({
		mutationFn: (payload: { id: number; is_visible: boolean }) =>
			setFriendLinkVisibility(payload.id, payload.is_visible),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-friend-links"] });
		},
	});

	const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const payload = {
			name: form.name.trim(),
			url: form.url.trim(),
			avatar_url: form.avatar_url.trim(),
			type: form.type.trim(),
			description: form.description.trim(),
			sort_weight: form.sort_weight.trim(),
			is_visible: form.is_visible,
		};
		if (!payload.name || !payload.url) return;
		if (editing) {
			updateMutation.mutate({ id: editing.id, body: payload });
		} else {
			createMutation.mutate(payload);
		}
	};

	const isMutating =
		createMutation.isPending ||
		updateMutation.isPending ||
		deleteMutation.isPending;

	const isDirty = useMemo(() => {
		return (
			searchInput.trim() !== search ||
			visibilityFilterInput !== visibilityFilter
		);
	}, [search, searchInput, visibilityFilter, visibilityFilterInput]);

	const canClear = useMemo(() => {
		return (
			searchInput.trim().length > 0 ||
			search.length > 0 ||
			visibilityFilterInput !== "all" ||
			visibilityFilter !== "all"
		);
	}, [search, searchInput, visibilityFilter, visibilityFilterInput]);

	const applyFilters = () => {
		setSearch(searchInput.trim());
		setVisibilityFilter(visibilityFilterInput);
		setPageAndInput(1);
	};

	const clearFilters = () => {
		setSearchInput("");
		setSearch("");
		setVisibilityFilterInput("all");
		setVisibilityFilter("all");
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
				title="Friend Links"
				description="Publish curated partners and references."
				actions={
					<Button type="button" size="sm" onClick={openCreateDialog}>
						New Link
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
					<div className="text-sm text-muted-foreground">
						Search by name or description, and filter by visibility, then apply
						the filters.
					</div>
					<div className="grid gap-6 lg:grid-cols-2">
						<div className="flex flex-col gap-5">
							<Label htmlFor="links-search">Search</Label>
							<Input
								id="links-search"
								placeholder="Search links..."
								value={searchInput}
								onChange={(event) => {
									setSearchInput(event.target.value);
								}}
								onKeyDown={(event) => {
									if (event.key === "Enter") applyFilters();
								}}
							/>
						</div>
						<div className="flex flex-col gap-5">
							<Label>Visibility</Label>
							<SelectMenu
								value={visibilityFilterInput}
								onValueChange={(value) => {
									const next = value as "all" | "visible" | "hidden";
									setVisibilityFilterInput(next);
								}}
								options={[
									{ value: "all", label: "All links" },
									{ value: "visible", label: "Visible only" },
									{ value: "hidden", label: "Hidden only" },
								]}
								placeholder="All links"
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
							<span className="font-medium text-foreground">
								Total: {total}
							</span>{" "}
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
									htmlFor="links-page"
									className="text-xs text-muted-foreground whitespace-nowrap"
								>
									Go to
								</Label>
								<Input
									id="links-page"
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
								<TableHead>Name</TableHead>
								<TableHead className="hidden md:table-cell">URL</TableHead>
								<TableHead>Visible</TableHead>
								<TableHead className="hidden md:table-cell">Sort</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paged.map((link) => (
								<TableRow key={link.id}>
									<TableCell>
										<div className="font-medium">{link.name}</div>
										<div className="text-xs text-muted-foreground">
											{link.type ?? "-"}
										</div>
									</TableCell>
									<TableCell className="hidden md:table-cell text-sm text-muted-foreground">
										{link.url}
									</TableCell>
									<TableCell>
										<Switch
											checked={link.is_visible}
											onCheckedChange={(checked) =>
												visibilityMutation.mutate({
													id: link.id,
													is_visible: checked,
												})
											}
											disabled={visibilityMutation.isPending}
										/>
									</TableCell>
									<TableCell className="hidden md:table-cell text-sm text-muted-foreground">
										{link.sort_weight ?? 0}
									</TableCell>
									<TableCell className="text-right">
										<div className="hidden justify-end gap-2 sm:flex">
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => openEditDialog(link)}
											>
												<Pencil className="h-4 w-4" />
												Edit
											</Button>
											<Button
												type="button"
												variant="destructive"
												size="sm"
												onClick={() => {
													if (!confirm(`Delete link #${link.id}?`)) return;
													deleteMutation.mutate(link.id);
												}}
												disabled={deleteMutation.isPending}
											>
												<Trash2 className="h-4 w-4" />
												Delete
											</Button>
										</div>
										<div className="flex justify-end gap-2 sm:hidden">
											<Button
												type="button"
												variant="outline"
												size="icon"
												onClick={() => openEditDialog(link)}
												aria-label="Edit"
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												type="button"
												variant="destructive"
												size="icon"
												disabled={deleteMutation.isPending}
												onClick={() => {
													if (!confirm(`Delete link #${link.id}?`)) return;
													deleteMutation.mutate(link.id);
												}}
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
										colSpan={5}
										className="py-8 text-center text-sm text-muted-foreground"
									>
										{listQuery.isPending
											? "Loading..."
											: "No links match your filters."}
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
						className="w-full max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl"
					>
						<div>
							<h3 className="text-lg font-semibold">
								{editing ? "Edit Link" : "New Link"}
							</h3>
							<p className="text-sm text-muted-foreground">
								Showcase friendly resources on the Links page.
							</p>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
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
								<label className="text-sm font-medium">URL</label>
								<Input
									required
									value={form.url}
									onChange={(event) =>
										setForm((prev) => ({ ...prev, url: event.target.value }))
									}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Avatar URL</label>
								<Input
									value={form.avatar_url}
									onChange={(event) =>
										setForm((prev) => ({
											...prev,
											avatar_url: event.target.value,
										}))
									}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Type</label>
								<Input
									value={form.type}
									onChange={(event) =>
										setForm((prev) => ({ ...prev, type: event.target.value }))
									}
									placeholder="blog / partner / tool"
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Sort weight</label>
								<Input
									type="number"
									value={form.sort_weight}
									onChange={(event) =>
										setForm((prev) => ({
											...prev,
											sort_weight: event.target.value,
										}))
									}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Visibility</label>
								<div className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
									<Switch
										checked={form.is_visible}
										onCheckedChange={(checked) =>
											setForm((prev) => ({ ...prev, is_visible: checked }))
										}
									/>
									<span className="text-sm text-muted-foreground">
										{form.is_visible ? "Shown publicly" : "Hidden"}
									</span>
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Description</label>
							<Textarea
								rows={3}
								value={form.description}
								onChange={(event) =>
									setForm((prev) => ({
										...prev,
										description: event.target.value,
									}))
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
