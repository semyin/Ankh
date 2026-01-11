export { app as articleRoute };

import { createApp } from "@/api/utils";
import { calculatePagination } from "@/api/utils/pagination";
import { result } from "@/api/utils/response";

const app = createApp();

app.get("/", async (c) => {
	const supabase = c.get("supabase");

	const response = await supabase
		.from("article")
		.select(
			"id, title, summary, created_at, category(id, name, emoji), tags:tag(id, name)",
			{ count: "exact" },
		)
		.eq("is_published", true)
		.order("created_at", { ascending: false });

	return result.from(c, response);
});

app.get("/admin", async (c) => {
	const supabase = c.get("supabase");
	const query = c.req.query();
	const { title, category_id, tag_id, tag_ids, is_published } = query;

	// 分页参数处理
	const { limit, offset } = calculatePagination({
		page: query.page,
		pageSize: query.pageSize,
	});

	let queryBuilder = supabase.from("article").select(
		`
      id, title, cover_image, is_top, is_published, view_count, created_at, updated_at,
      category(id, name, emoji),
      tags:tag(id, name)
    `,
		{ count: "exact" },
	);

	if (title) queryBuilder = queryBuilder.ilike("title", `%${title}%`);
	if (category_id)
		queryBuilder = queryBuilder.eq("category_id", Number(category_id));
	if (is_published !== undefined)
		queryBuilder = queryBuilder.eq("is_published", is_published === "true");

	const tagIds = tag_ids
		? String(tag_ids)
				.split(",")
				.map((v) => Number(v))
				.filter((v) => Number.isFinite(v) && v > 0)
		: tag_id
			? [Number(tag_id)].filter((v) => Number.isFinite(v) && v > 0)
			: [];

	if (tagIds.length > 0) {
		const { data: articleIds } = await supabase
			.from("article_tag")
			.select("article_id")
			.in("tag_id", tagIds);
		if (articleIds)
			queryBuilder = queryBuilder.in(
				"id",
				articleIds.map((a) => a.article_id),
			);
	}

	const response = await queryBuilder
		.order("created_at", { ascending: false })
		.range(offset, offset + limit - 1);

	return result.from(c, response);
});

app.get("/admin/:id", async (c) => {
	const id = Number(c.req.param("id"));
	const supabase = c.get("supabase");

	const response = await supabase
		.from("article")
		.select(`*, 
      category(id, name, description, created_at, updated_at, emoji), 
      tags:tag(id, name, img_url, created_at, updated_at)`)
		.eq("id", id)
		.single();

	return result.from(c, response);
});

app.get("/:id", async (c) => {
	const id = Number(c.req.param("id"));
	const supabase = c.get("supabase");

	const response = await supabase
		.from("article")
		.select(`*, 
      category(id, name, description, created_at, updated_at, emoji), 
      tags:tag(id, name, img_url, created_at, updated_at)`)
		.eq("id", id)
		.eq("is_published", true)
		.single();

	return result.from(c, response);
});

app.post("/", async (c) => {
	const supabase = c.get("supabase");
	const body = await c.req.json();

	const response = await supabase
		.from("article")
		.insert(body)
		.select()
		.single();

	return result.from(c, response);
});

app.put("/:id", async (c) => {
	const id = Number(c.req.param("id"));
	const supabase = c.get("supabase");
	const body = await c.req.json();

	const response = await supabase
		.from("article")
		.update(body)
		.eq("id", id)
		.select()
		.single();

	return result.from(c, response);
});

app.delete("/:id", async (c) => {
	const id = Number(c.req.param("id"));
	const supabase = c.get("supabase");

	const response = await supabase
		.from("article")
		.delete()
		.eq("id", id)
		.select()
		.single();

	return result.from(c, response);
});

app.patch("/:id/publish", async (c) => {
	const id = Number(c.req.param("id"));
	const body = await c.req.json();
	const { is_published } = body;
	const supabase = c.get("supabase");

	const response = await supabase
		.from("article")
		.update({ is_published })
		.eq("id", id)
		.select()
		.single();

	return result.from(c, response);
});

app.put("/:id/tags", async (c) => {
	const id = Number(c.req.param("id"));
	const supabase = c.get("supabase");
	const { tagIds } = await c.req.json<{ tagIds: number[] }>();

	await supabase.from("article_tag").delete().eq("article_id", id);

	if (tagIds.length > 0) {
		const response = await supabase
			.from("article_tag")
			.insert(tagIds.map((tag_id) => ({ article_id: id, tag_id })));

		return result.from(c, response);
	}

	return result.from(c, { data: [], error: null });
});
