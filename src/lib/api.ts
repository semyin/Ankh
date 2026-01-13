export type ApiSuccessResponse<T> = {
	code: number;
	msg: string;
	data: T;
	count?: number;
};

export async function apiResult<T>(
	path: string,
	init?: RequestInit,
): Promise<ApiSuccessResponse<T>> {
	const res = await fetch(path, {
		...init,
		headers: {
			accept: "application/json",
			...(init?.headers ?? {}),
		},
	});

	let json: unknown;
	try {
		json = await res.json();
	} catch {
		json = null;
	}

	if (!res.ok) {
		const message =
			typeof json === "object" && json && "msg" in json
				? String((json as any).msg)
				: `Request failed: ${res.status}`;
		throw new Error(message);
	}

	const parsed = json as ApiSuccessResponse<T>;
	if (!parsed || typeof parsed !== "object" || parsed.code !== 200) {
		throw new Error(
			typeof parsed === "object" && parsed && "msg" in parsed
				? String((parsed as any).msg)
				: "Unexpected API response",
		);
	}

	return parsed;
}

export async function apiData<T>(path: string, init?: RequestInit): Promise<T> {
	return (await apiResult<T>(path, init)).data;
}

export type Category = {
	id: number;
	name: string;
	emoji: string | null;
	description: string | null;
	created_at: string;
	updated_at: string;
};

export type Tag = {
	id: number;
	name: string;
	img_url: string | null;
	usage_count: number | null;
	created_at: string;
	updated_at: string;
};

export type Meta = {
	id: number;
	name: string | null;
	property: string | null;
	content: string | null;
	resource_type: string | null;
	resource_id: number | null;
	is_default: boolean;
	created_at: string;
	updated_at: string;
};

export type FriendLink = {
	id: number;
	name: string;
	url: string;
	description: string | null;
	avatar_url: string | null;
	is_visible: boolean;
	sort_weight: number;
	type: string | null;
	created_at: string;
	updated_at: string;
};

export type Profile = {
	id: number;
	name: string;
	author_name: string | null;
	avatar_url: string | null;
	bio: string | null;
	description: string | null;
	location: string | null;
	url: string;
	contacts: any | null;
	skills: any | null;
	about_content: string | null;
	copyright: string | null;
	icp: string | null;
};

export type ArticleCategory = {
	id: number;
	name: string;
	emoji: string | null;
};

export type ArticleTag = {
	id: number;
	name: string;
	img_url?: string | null;
};

export type ArticleListItem = {
	id: number;
	title: string;
	summary: string | null;
	created_at: string;
	category: ArticleCategory | null;
	tags: ArticleTag[] | null;
};

export type ArticleDetail = {
	id: number;
	title: string;
	summary: string | null;
	content: string;
	created_at: string;
	updated_at: string;
	category: (ArticleCategory & { description?: string | null }) | null;
	tags: ArticleTag[] | null;
};

export type AdminArticleListItem = {
	id: number;
	title: string;
	cover_image: string | null;
	is_top: boolean;
	is_published: boolean;
	view_count: number;
	created_at: string;
	updated_at: string;
	category: ArticleCategory | null;
	tags: Array<Pick<ArticleTag, "id" | "name">> | null;
};

export type AdminArticleDetail = {
	id: number;
	title: string;
	summary: string | null;
	content: string;
	cover_image: string | null;
	is_top: boolean;
	is_published: boolean;
	created_at: string;
	updated_at: string;
	category: (ArticleCategory & { description?: string | null }) | null;
	tags: ArticleTag[] | null;
};

export function login(email: string, password: string) {
	return apiData<any>("/api/auth/login", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ email, password }),
	});
}

export function logout() {
	return apiData<null>("/api/auth/logout", { method: "POST" });
}

export function getMe() {
	return apiData<any>("/api/auth/me");
}

export function getProfile() {
	return apiData<Profile>("/api/profile");
}

export function updateProfile(payload: Partial<Profile>) {
	return apiData<Profile>("/api/profile", {
		method: "PUT",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(payload),
	});
}

export function getCategories() {
	return apiData<Category[]>("/api/categories");
}

export function createCategory(payload: {
	name: string;
	emoji?: string | null;
	description?: string | null;
}) {
	return apiData<Category>("/api/categories", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(payload),
	});
}

export function updateCategory(
	id: number,
	payload: Partial<{
		name: string;
		emoji: string | null;
		description: string | null;
	}>,
) {
	return apiData<Category>(`/api/categories/${id}`, {
		method: "PUT",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(payload),
	});
}

export function deleteCategory(id: number) {
	return apiData<Category>(`/api/categories/${id}`, { method: "DELETE" });
}

export function getTags() {
	return apiData<Tag[]>("/api/tags");
}

export function createTag(payload: { name: string; img_url?: string | null }) {
	return apiData<Tag>("/api/tags", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(payload),
	});
}

export function updateTag(
	id: number,
	payload: Partial<{ name: string; img_url: string | null }>,
) {
	return apiData<Tag>(`/api/tags/${id}`, {
		method: "PUT",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(payload),
	});
}

export function deleteTag(id: number) {
	return apiData<Tag>(`/api/tags/${id}`, { method: "DELETE" });
}

export function getMeta(params?: {
	resource_type?: string;
	resource_id?: number;
}) {
	const qs = new URLSearchParams();
	if (params?.resource_type) qs.set("resource_type", params.resource_type);
	if (params?.resource_id !== undefined)
		qs.set("resource_id", String(params.resource_id));
	const path = qs.size ? `/api/meta?${qs}` : "/api/meta";
	return apiData<Meta[]>(path);
}

export function createMeta(payload: {
	name: string | null;
	property: string | null;
	content: string | null;
	resource_type?: string | null;
	resource_id?: number | null;
	is_default?: boolean;
}) {
	return apiData<Meta>("/api/meta", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			...payload,
			resource_type:
				payload.resource_type === undefined ? null : payload.resource_type,
			resource_id:
				payload.resource_id === undefined ? null : payload.resource_id,
			is_default: payload.is_default ?? false,
		}),
	});
}

export function updateMeta(
	id: number,
	payload: Partial<{
		name: string | null;
		property: string | null;
		content: string | null;
		resource_type: string | null;
		resource_id: number | null;
		is_default: boolean;
	}>,
) {
	return apiData<Meta>(`/api/meta/${id}`, {
		method: "PUT",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(payload),
	});
}

export function deleteMeta(id: number) {
	return apiData<Meta>(`/api/meta/${id}`, { method: "DELETE" });
}

export function getFriendLinks() {
	return apiData<FriendLink[]>("/api/friend-links?is_visible=true");
}

export function getAdminFriendLinks(params?: { is_visible?: boolean }) {
	const qs = new URLSearchParams();
	if (params?.is_visible !== undefined) {
		qs.set("is_visible", String(params.is_visible));
	}
	const path = qs.size ? `/api/friend-links?${qs}` : "/api/friend-links";
	return apiData<FriendLink[]>(path);
}

export function createFriendLink(payload: {
	name: string;
	url: string;
	description?: string | null;
	avatar_url?: string | null;
	is_visible?: boolean;
	sort_weight?: number;
	type?: string | null;
}) {
	return apiData<FriendLink>("/api/friend-links", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(payload),
	});
}

export function updateFriendLink(
	id: number,
	payload: Partial<{
		name: string;
		url: string;
		description: string | null;
		avatar_url: string | null;
		is_visible: boolean;
		sort_weight: number;
		type: string | null;
	}>,
) {
	return apiData<FriendLink>(`/api/friend-links/${id}`, {
		method: "PUT",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(payload),
	});
}

export function deleteFriendLink(id: number) {
	return apiData<FriendLink>(`/api/friend-links/${id}`, { method: "DELETE" });
}

export function setFriendLinkVisibility(id: number, is_visible: boolean) {
	return apiData<FriendLink>(`/api/friend-links/${id}/visibility`, {
		method: "PATCH",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ is_visible }),
	});
}

export function getArticles() {
	return apiData<ArticleListItem[]>("/api/articles");
}

export function getArticle(id: number) {
	return apiData<ArticleDetail>(`/api/articles/${id}`);
}

export async function getAdminArticles(params?: {
	title?: string;
	category_id?: number;
	tag_ids?: number[];
	is_published?: boolean;
	page?: number;
	pageSize?: number;
}) {
	const qs = new URLSearchParams();
	if (params?.title) qs.set("title", params.title);
	if (params?.category_id !== undefined)
		qs.set("category_id", String(params.category_id));
	if (params?.tag_ids?.length) qs.set("tag_ids", params.tag_ids.join(","));
	if (params?.is_published !== undefined)
		qs.set("is_published", String(params.is_published));
	if (params?.page !== undefined) qs.set("page", String(params.page));
	if (params?.pageSize !== undefined)
		qs.set("pageSize", String(params.pageSize));

	const path = qs.size ? `/api/articles/admin?${qs}` : "/api/articles/admin";
	const res = await apiResult<AdminArticleListItem[]>(path);
	return { items: res.data, count: res.count ?? 0 };
}

export function getAdminArticle(id: number) {
	return apiData<AdminArticleDetail>(`/api/articles/admin/${id}`);
}

export function createArticle(payload: {
	title: string;
	summary: string | null;
	content: string;
	is_published?: boolean;
	category_id?: number | null;
	cover_image?: string | null;
	is_top?: boolean;
}) {
	return apiData<AdminArticleDetail>("/api/articles", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(payload),
	});
}

export function updateArticle(
	id: number,
	payload: Partial<{
		title: string;
		summary: string | null;
		content: string;
		cover_image: string | null;
		is_top: boolean;
		is_published: boolean;
		category_id: number | null;
	}>,
) {
	return apiData<AdminArticleDetail>(`/api/articles/${id}`, {
		method: "PUT",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(payload),
	});
}

export function setArticlePublished(id: number, is_published: boolean) {
	return apiData<AdminArticleDetail>(`/api/articles/${id}/publish`, {
		method: "PATCH",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ is_published }),
	});
}

export function setArticleTags(id: number, tagIds: number[]) {
	return apiData<unknown>(`/api/articles/${id}/tags`, {
		method: "PUT",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ tagIds }),
	});
}

export function deleteArticle(id: number) {
	return apiData<AdminArticleDetail>(`/api/articles/${id}`, {
		method: "DELETE",
	});
}

export function uploadImage(file: File) {
	const form = new FormData();
	form.append("file", file);
	return apiData<{ path: string; url: string }>("/api/upload", {
		method: "POST",
		body: form,
	});
}
