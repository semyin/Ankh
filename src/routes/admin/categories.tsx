import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, AdminSurface } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/categories")({
	component: CategoriesAdminPage,
});

function CategoriesAdminPage() {
	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Categories"
				description="Manage categories (coming soon)."
			/>
			<AdminSurface innerClassName="p-6">
				<div className="text-sm text-muted-foreground">
					This section is not implemented yet.
				</div>
			</AdminSurface>
		</div>
	);
}

