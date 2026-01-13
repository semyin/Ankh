export { app as tagRoute };

import { createApp } from "@/api/utils";
import { result } from "@/api/utils/response";

const app = createApp();

app.get("/", async (c) => {
	const supabase = c.get("supabase");
	const response = await supabase.from("tag").select("*");
	return result.from(c, response);
});

app.get("/:id", async (c) => {
	const supabase = c.get("supabase");
	const id = Number(c.req.param("id"));
	const response = await supabase
		.from("tag")
		.select(`*, articles:article(id, title, content, created_at)`)
		.eq("id", id)
		.single();

	return result.from(c, response);
});

app.post("/", async (c) => {
	const supabase = c.get("supabase");
	const body = await c.req.json();
	const response = await supabase.from("tag").insert(body).select().single();

	return result.from(c, response);
});

app.put("/:id", async (c) => {
	const supabase = c.get("supabase");
	const id = Number(c.req.param("id"));
	const body = await c.req.json();
	const response = await supabase
		.from("tag")
		.update(body)
		.eq("id", id)
		.select()
		.single();

	return result.from(c, response);
});

app.delete("/:id", async (c) => {
	const supabase = c.get("supabase");
	const id = Number(c.req.param("id"));
	const response = await supabase
		.from("tag")
		.delete()
		.eq("id", id)
		.select()
		.single();

	return result.from(c, response);
});
