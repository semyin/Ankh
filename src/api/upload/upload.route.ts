export { app as uploadRoute };

import { bodyLimit } from "hono/body-limit";
import { createApp } from "@/api/utils";
import { result } from "@/api/utils/response";

const app = createApp();

const ALLOWED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/svg+xml",
];

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME;

function generateSafeFileName(originalName: string): string {
	const lastDotIndex = originalName.lastIndexOf(".");
	const ext = lastDotIndex !== -1 ? originalName.substring(lastDotIndex) : "";

	const randomStr = Math.random().toString(36).substring(2, 15);
	const timestamp = Date.now();

	return `${timestamp}-${randomStr}${ext}`;
}

app.post(
	"/",
	bodyLimit({
		maxSize: MAX_FILE_SIZE,
		onError: (c) => {
			return result.error(
				c,
				`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024} MB`,
				400,
			);
		},
	}),
	async (c) => {
		if (!BUCKET_NAME) {
			return result.error(c, "SUPABASE_BUCKET_NAME is not configured", 500);
		}

		const supabase = c.get("supabase");
		const body = await c.req.parseBody();
		const file = (body as { file?: File }).file;

		if (!file) {
			return result.error(c, "No file provided", 400);
		}

		if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
			return result.error(
				c,
				`Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
				400,
			);
		}

		const fileName = generateSafeFileName(file.name);

		const { data, error } = await supabase.storage
			.from(BUCKET_NAME)
			.upload(fileName, file, {
				contentType: file.type,
				cacheControl: "3600",
				upsert: false,
			});

		if (error) {
			if (error.message?.includes("Bucket not found")) {
				return result.error(
					c,
					`Bucket not found: ${BUCKET_NAME}. Please create this bucket in Supabase Storage or update SUPABASE_BUCKET_NAME.`,
					500,
				);
			}

			return result.error(c, error.message, 500);
		}

		const { data: urlData } = supabase.storage
			.from(BUCKET_NAME)
			.getPublicUrl(fileName);

		return result.ok(c, {
			path: data.path,
			url: urlData.publicUrl,
		});
	},
);

app.delete("/:path", async (c) => {
	if (!BUCKET_NAME) {
		return result.error(c, "SUPABASE_BUCKET_NAME is not configured", 500);
	}

	const supabase = c.get("supabase");
	const path = c.req.param("path");

	const response = await supabase.storage.from(BUCKET_NAME).remove([path]);

	return result.from(c, response);
});

app.get("/list", async (c) => {
	const { page = 1, pageSize = 100 } = c.req.query();

	if (!BUCKET_NAME) {
		return result.error(c, "SUPABASE_BUCKET_NAME is not configured", 500);
	}

	const supabase = c.get("supabase");
	const { folder = "" } = c.req.query();

	const response = await supabase.storage.from(BUCKET_NAME).list(folder, {
		limit: Number(pageSize),
		offset: (Number(page) - 1) * Number(pageSize),
		sortBy: { column: "created_at", order: "desc" },
	});

	return result.from(c, response, [
		"last_accessed_at",
		"created_at",
		"updated_at",
		"lastModified",
	]);
});
