export { app as categoryRoute };

import { createApp } from "@/api/utils";
import { result } from "@/api/utils/response";

const app = createApp();

app.get("/", async (c) => {
	const supabase = c.get("supabase");

	const response = await supabase.from("category").select("*");
	// return result.error(c, '查询失败')
	return result.from(c, response);
});

app.get("/:id", async (c) => {
	const id = Number(c.req.param("id"));
	const supabase = c.get("supabase");

	const response = await supabase
		.from("category")
		.select(`
      *,
      articles:article(id, title, content, category_id, created_at, updated_at)
    `)
		.eq("id", id)
		.single();

	return result.from(c, response);
});

app.post("/", async (c) => {
	const supabase = c.get("supabase");
	const body = await c.req.json();

	const response = await supabase
		.from("category")
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
		.from("category")
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
		.from("category")
		.delete()
		.eq("id", id)
		.select()
		.single();

	return result.from(c, response);
});
