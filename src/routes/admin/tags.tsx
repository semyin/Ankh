import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, AdminSurface } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/tags")({
	component: TagsAdminPage,
});

function TagsAdminPage() {
	return (
		<div className="space-y-6">
			<AdminPageHeader title="Tags" description="Manage tags (coming soon)." />
			<AdminSurface innerClassName="p-6">
				<div className="text-sm text-muted-foreground">
					This section is not implemented yet.
				</div>
			</AdminSurface>
		</div>
	);
}

