import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type MetaDraft = {
	id?: number;
	name: string;
	property: string;
	content: string;
};

export function MetaEditor({
	value,
	onChange,
	disabled,
	className,
}: {
	value: MetaDraft[];
	onChange: (next: MetaDraft[]) => void;
	disabled?: boolean;
	className?: string;
}) {
	const addRow = () => {
		onChange([...value, { name: "", property: "", content: "" }]);
	};

	const updateRow = (index: number, patch: Partial<MetaDraft>) => {
		onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));
	};

	const removeRow = (index: number) => {
		onChange(value.filter((_, i) => i !== index));
	};

	return (
		<div className={cn("space-y-4", className)}>
			<div className="text-sm text-muted-foreground">
				Add any meta tags you want. Provide either `name` or `property`, plus
				`content`.
			</div>

			<div className="space-y-4">
				{value.length === 0 ? (
					<div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
						No meta tags yet.
					</div>
				) : (
					value.map((row, index) => (
						<div
							key={row.id ?? index}
							className="rounded-lg border border-border bg-background p-4"
						>
							<div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
								<div className="flex flex-col gap-3">
									<Label>Name</Label>
									<Input
										value={row.name}
										onChange={(e) => updateRow(index, { name: e.target.value })}
										placeholder="description"
										disabled={disabled}
									/>
								</div>

								<div className="flex flex-col gap-3">
									<Label>Property</Label>
									<Input
										value={row.property}
										onChange={(e) =>
											updateRow(index, { property: e.target.value })
										}
										placeholder="og:title"
										disabled={disabled}
									/>
								</div>
							</div>

							<div className="mt-4 flex flex-col gap-3">
								<Label>Content</Label>
								<Input
									value={row.content}
									onChange={(e) =>
										updateRow(index, { content: e.target.value })
									}
									placeholder="Value..."
									disabled={disabled}
								/>
							</div>

							<div className="mt-4 flex justify-end">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => removeRow(index)}
									disabled={disabled}
								>
									<Trash2 className="h-4 w-4" />
									Remove
								</Button>
							</div>
						</div>
					))
				)}
			</div>

			<Button
				type="button"
				variant="secondary"
				size="sm"
				onClick={addRow}
				disabled={disabled}
			>
				<Plus className="h-4 w-4" />
				Add meta
			</Button>
		</div>
	);
}
