export function parseDateTime(value: string) {
	const normalized = value.includes("T") ? value : value.replace(" ", "T");
	const date = new Date(normalized);
	return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string) {
	const date = parseDateTime(value);
	if (!date) return value;
	return new Intl.DateTimeFormat("zh-CN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
}

export function estimateReadingTime(text: string) {
	return Math.ceil(text.length / 400);
}

export function slugify(value: unknown) {
	return String(value ?? "")
		.trim()
		.toLowerCase()
		.replace(/[^\w\u4e00-\u9fa5]+/g, "-")
		.replace(/^-+|-+$/g, "");
}
