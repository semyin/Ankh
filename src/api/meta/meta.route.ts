export { app as metaRoute };

import { createApp } from "@/api/utils";
import { result } from "@/api/utils/response";

const app = createApp();

app.get("/", async (c) => {
	const supabase = c.get("supabase");
	const { resource_type, resource_id } = c.req.query();

	let query = supabase
		.from("meta")
		.select("*")
		.order("created_at", { ascending: false });

	if (resource_type) query = query.eq("resource_type", resource_type);
	if (resource_id) query = query.eq("resource_id", Number(resource_id));

	const response = await query;

	return result.from(c, response);
});

app.get("/:id", async (c) => {
	const id = Number(c.req.param("id"));
	const supabase = c.get("supabase");

	const response = await supabase
		.from("meta")
		.select("*")
		.eq("id", id)
		.single();

	return result.from(c, response);
});

app.post("/", async (c) => {
	const supabase = c.get("supabase");
	const body = await c.req.json();

	const response = await supabase.from("meta").insert(body).select().single();

	return result.from(c, response);
});

app.put("/:id", async (c) => {
	const id = Number(c.req.param("id"));
	const supabase = c.get("supabase");
	const body = await c.req.json();

	const response = await supabase
		.from("meta")
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
		.from("meta")
		.delete()
		.eq("id", id)
		.select()
		.single();

	return result.from(c, response);
});
