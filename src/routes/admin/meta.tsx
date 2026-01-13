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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Meta, createMeta, deleteMeta, getMeta, updateMeta } from "@/lib/api";

export const Route = createFileRoute("/admin/meta")({
	component: AdminMetaPage,
});

type MetaFormState = {
	name: string;
	property: string;
	content: string;
	resource_type: string;
	resource_id: string;
	is_default: boolean;
};

const emptyForm: MetaFormState = {
	name: "",
	property: "",
	content: "",
	resource_type: "",
	resource_id: "",
	is_default: false,
};

const pageSize = 10;

function AdminMetaPage() {
	const queryClient = useQueryClient();

	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [resourceTypeInput, setResourceTypeInput] = useState("");
	const [resourceType, setResourceType] = useState("");
	const [resourceIdInput, setResourceIdInput] = useState("");
	const [resourceId, setResourceId] = useState("");
	const [page, setPage] = useState(1);
	const [pageInput, setPageInput] = useState("1");

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<Meta | null>(null);
	const [form, setForm] = useState<MetaFormState>(emptyForm);
	const [formError, setFormError] = useState<string | null>(null);

	const resourceIdNumber = useMemo(() => {
		if (!resourceId.length) return undefined;
		const parsed = Number(resourceId);
		return Number.isFinite(parsed) ? parsed : undefined;
	}, [resourceId]);

	const queryKey = useMemo(
		() => [
			"meta-admin",
			{
				resourceType: resourceType || null,
				resourceId: resourceIdNumber ?? null,
			},
		],
		[resourceIdNumber, resourceType],
	);

	const metaQuery = useQuery({
		queryKey,
		queryFn: () =>
			getMeta({
				resource_type: resourceType ? resourceType : undefined,
				resource_id: resourceIdNumber,
			}),
	});

	const metas = metaQuery.data ?? [];

	const filtered = useMemo(() => {
		const term = search.trim().toLowerCase();
		return metas.filter((meta) => {
			const matchesTerm = term
				? [meta.name, meta.property, meta.content].some((value) =>
						value?.toLowerCase().includes(term),
					)
				: true;
			const matchesType = resourceType
				? (meta.resource_type ?? "").toLowerCase() ===
					resourceType.toLowerCase()
				: true;
			const matchesId =
				resourceIdNumber === undefined
					? true
					: meta.resource_id === resourceIdNumber;
			return matchesTerm && matchesType && matchesId;
		});
	}, [metas, resourceIdNumber, resourceType, search]);

	const total = filtered.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const currentPage = Math.min(page, totalPages);
	const paged = useMemo(
		() => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
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

	const isDirty = useMemo(() => {
		return (
			searchInput.trim() !== search ||
			resourceTypeInput.trim() !== resourceType ||
			resourceIdInput.trim() !== resourceId
		);
	}, [
		resourceId,
		resourceIdInput,
		resourceType,
		resourceTypeInput,
		search,
		searchInput,
	]);

	const canClear = useMemo(() => {
		return (
			searchInput.trim().length > 0 ||
			resourceTypeInput.trim().length > 0 ||
			resourceIdInput.trim().length > 0 ||
			search.length > 0 ||
			resourceType.length > 0 ||
			resourceId.length > 0
		);
	}, [
		resourceId,
		resourceIdInput,
		resourceType,
		resourceTypeInput,
		search,
		searchInput,
	]);

	const applyFilters = () => {
		setSearch(searchInput.trim());
		setResourceType(resourceTypeInput.trim());
		setResourceId(resourceIdInput.trim());
		setPageAndInput(1);
	};

	const clearFilters = () => {
		setSearchInput("");
		setResourceTypeInput("");
		setResourceIdInput("");
		setSearch("");
		setResourceType("");
		setResourceId("");
		setPageAndInput(1);
	};

	const onGoToPage = () => {
		const parsed = Number(pageInput);
		if (!Number.isFinite(parsed)) return;
		const next = Math.max(1, Math.min(totalPages, Math.trunc(parsed)));
		setPageAndInput(next);
	};

	const openCreateDialog = () => {
		setEditing(null);
		setForm(emptyForm);
		setFormError(null);
		setDialogOpen(true);
	};

	const openEditDialog = (meta: Meta) => {
		setEditing(meta);
		setForm({
			name: meta.name ?? "",
			property: meta.property ?? "",
			content: meta.content ?? "",
			resource_type: meta.resource_type ?? "",
			resource_id: meta.resource_id !== null ? String(meta.resource_id) : "",
			is_default: meta.is_default,
		});
		setFormError(null);
		setDialogOpen(true);
	};

	const closeDialog = () => {
		setDialogOpen(false);
		setEditing(null);
		setForm(emptyForm);
		setFormError(null);
	};

	const createMutation = useMutation({
		mutationFn: createMeta,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["meta-admin"] });
			closeDialog();
		},
	});

	const updateMutation = useMutation({
		mutationFn: (payload: { id: number; body: MetaFormState }) =>
			updateMeta(payload.id, {
				name: payload.body.name || null,
				property: payload.body.property || null,
				content: payload.body.content || null,
				resource_type: payload.body.resource_type || null,
				resource_id: payload.body.resource_id
					? Number(payload.body.resource_id)
					: null,
				is_default: payload.body.is_default,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["meta-admin"] });
			closeDialog();
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteMeta,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["meta-admin"] });
		},
	});

	const isMutating = createMutation.isPending || updateMutation.isPending;

	const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setFormError(null);

		const payload = {
			name: form.name.trim(),
			property: form.property.trim(),
			content: form.content.trim(),
			resource_type: form.resource_type.trim(),
			resource_id: form.resource_id.trim(),
			is_default: form.is_default,
		};

		if (!payload.name && !payload.property) {
			setFormError("Provide either a name or property attribute.");
			return;
		}

		if (!payload.content) {
			setFormError("Content is required.");
			return;
		}

		if (!payload.is_default) {
			if (!payload.resource_type) {
				setFormError("Resource type is required unless the meta is default.");
				return;
			}
			if (!payload.resource_id) {
				setFormError("Resource ID is required unless the meta is default.");
				return;
			}
			if (!Number.isFinite(Number(payload.resource_id))) {
				setFormError("Resource ID must be a number.");
				return;
			}
		}

		const nextBody: MetaFormState = {
			...payload,
		};

		if (editing) {
			updateMutation.mutate({ id: editing.id, body: nextBody });
		} else {
			createMutation.mutate({
				name: nextBody.name || null,
				property: nextBody.property || null,
				content: nextBody.content || null,
				resource_type: nextBody.is_default
					? null
					: nextBody.resource_type || null,
				resource_id: nextBody.is_default
					? null
					: nextBody.resource_id
						? Number(nextBody.resource_id)
						: null,
				is_default: nextBody.is_default,
			});
		}
	};

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Meta tags"
				description="Manage SEO/meta definitions for pages and articles."
				actions={
					<Button type="button" size="sm" onClick={openCreateDialog}>
						New Meta
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
					<div className="grid gap-6 lg:grid-cols-3">
						<div className="flex flex-col gap-5">
							<Label htmlFor="meta-search">Search</Label>
							<Input
								id="meta-search"
								placeholder="Search name/property/content..."
								value={searchInput}
								onChange={(event) => setSearchInput(event.target.value)}
								onKeyDown={(event) => {
									if (event.key === "Enter") applyFilters();
								}}
							/>
						</div>
						<div className="flex flex-col gap-5">
							<Label htmlFor="meta-resource-type">Resource type</Label>
							<Input
								id="meta-resource-type"
								placeholder="e.g. article, page"
								value={resourceTypeInput}
								onChange={(event) => setResourceTypeInput(event.target.value)}
								onKeyDown={(event) => {
									if (event.key === "Enter") applyFilters();
								}}
							/>
						</div>
						<div className="flex flex-col gap-5">
							<Label htmlFor="meta-resource-id">Resource ID</Label>
							<Input
								id="meta-resource-id"
								type="number"
								placeholder="123"
								value={resourceIdInput}
								onChange={(event) => setResourceIdInput(event.target.value)}
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
						{metaQuery.isPending ? (
							<div className="text-sm text-muted-foreground">Loading...</div>
						) : metaQuery.error ? (
							<div className="text-sm text-destructive">
								{metaQuery.error instanceof Error
									? metaQuery.error.message
									: "Failed to load meta entries"}
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
									htmlFor="meta-page"
									className="text-xs text-muted-foreground whitespace-nowrap"
								>
									Go to
								</Label>
								<Input
									id="meta-page"
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
								<TableHead>Name / Property</TableHead>
								<TableHead>Content</TableHead>
								<TableHead className="hidden lg:table-cell">Resource</TableHead>
								<TableHead className="hidden lg:table-cell">Default</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paged.map((meta) => (
								<TableRow key={meta.id}>
									<TableCell>
										<div className="font-medium">
											{meta.name ?? meta.property ?? "—"}
										</div>
										<div className="text-xs text-muted-foreground flex flex-wrap gap-2">
											<span>#{meta.id}</span>
											{meta.property ? (
												<span className="text-muted-foreground">property</span>
											) : meta.name ? (
												<span className="text-muted-foreground">name</span>
											) : null}
										</div>
									</TableCell>
									<TableCell className="text-sm text-muted-foreground">
										{meta.content ?? "—"}
									</TableCell>
									<TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
										{meta.resource_type ? (
											<div>
												<div className="text-foreground">
													{meta.resource_type}
												</div>
												<div className="text-xs text-muted-foreground">
													ID: {meta.resource_id ?? "—"}
												</div>
											</div>
										) : (
											<span>-</span>
										)}
									</TableCell>
									<TableCell className="hidden lg:table-cell">
										{meta.is_default ? (
											<Badge variant="outline">Default</Badge>
										) : (
											<span className="text-sm text-muted-foreground">No</span>
										)}
									</TableCell>
									<TableCell className="text-right">
										<div className="hidden justify-end gap-2 sm:flex">
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => openEditDialog(meta)}
											>
												<Pencil className="h-4 w-4" />
												Edit
											</Button>
											<Button
												type="button"
												variant="destructive"
												size="sm"
												disabled={deleteMutation.isPending}
												onClick={() => {
													if (!confirm(`Delete meta #${meta.id}?`)) return;
													deleteMutation.mutate(meta.id);
												}}
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
												onClick={() => openEditDialog(meta)}
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
													if (!confirm(`Delete meta #${meta.id}?`)) return;
													deleteMutation.mutate(meta.id);
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
										{metaQuery.isPending
											? "Loading..."
											: "No meta entries match your filters."}
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
								{editing ? "Edit meta tag" : "New meta tag"}
							</h3>
							<p className="text-sm text-muted-foreground">
								Describe the tag content and where it should apply.
							</p>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<label className="text-sm font-medium">Name</label>
								<Input
									value={form.name}
									onChange={(event) =>
										setForm((prev) => ({ ...prev, name: event.target.value }))
									}
									placeholder="e.g. description"
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Property</label>
								<Input
									value={form.property}
									onChange={(event) =>
										setForm((prev) => ({
											...prev,
											property: event.target.value,
										}))
									}
									placeholder="e.g. og:title"
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Resource type</label>
								<Input
									value={form.resource_type}
									onChange={(event) =>
										setForm((prev) => ({
											...prev,
											resource_type: event.target.value,
										}))
									}
									placeholder="article"
									disabled={form.is_default}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Resource ID</label>
								<Input
									type="number"
									value={form.resource_id}
									onChange={(event) =>
										setForm((prev) => ({
											...prev,
											resource_id: event.target.value,
										}))
									}
									placeholder="123"
									disabled={form.is_default}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Content</label>
							<Textarea
								rows={3}
								value={form.content}
								onChange={(event) =>
									setForm((prev) => ({ ...prev, content: event.target.value }))
								}
							/>
						</div>

						<div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
							<div>
								<div className="text-sm font-medium">Global meta</div>
								<div className="text-xs text-muted-foreground">
									A default meta applies everywhere, ignoring resource filters.
								</div>
							</div>
							<Switch
								checked={form.is_default}
								onCheckedChange={(checked) =>
									setForm((prev) => ({ ...prev, is_default: checked }))
								}
							/>
						</div>

						{formError ? (
							<div className="text-sm text-destructive">{formError}</div>
						) : null}
						{createMutation.isError && !formError ? (
							<div className="text-sm text-destructive">
								{createMutation.error instanceof Error
									? createMutation.error.message
									: "Failed to save meta."}
							</div>
						) : null}
						{updateMutation.isError && !formError ? (
							<div className="text-sm text-destructive">
								{updateMutation.error instanceof Error
									? updateMutation.error.message
									: "Failed to update meta."}
							</div>
						) : null}

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
