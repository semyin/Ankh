import { MultiSelectMenu } from "@/components/ui/select-menu";
import type { Tag } from "@/lib/api";

export function TagMultiSelect({
	tags,
	selectedTagIds,
	onChange,
	placeholder = "Select tags...",
}: {
	tags: Tag[];
	selectedTagIds: number[];
	onChange: (next: number[]) => void;
	placeholder?: string;
}) {
	return (
		<MultiSelectMenu
			values={selectedTagIds.map(String)}
			onValuesChange={(values) =>
				onChange(
					values
						.map((v) => Number(v))
						.filter((v) => Number.isFinite(v) && v > 0),
				)
			}
			options={tags.map((t) => ({ value: String(t.id), label: t.name }))}
			placeholder={placeholder}
			searchPlaceholder="Search tags..."
			emptyText="No tags."
		/>
	);
}
