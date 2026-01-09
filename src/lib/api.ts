export type ApiSuccessResponse<T> = {
	code: number;
	msg: string;
	data: T;
	count?: number;
};

export async function apiData<T>(path: string, init?: RequestInit): Promise<T> {
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

	return parsed.data;
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

export function getProfile() {
	return apiData<Profile>("/api/profile");
}

export function getCategories() {
	return apiData<Category[]>("/api/categories");
}

export function getTags() {
	return apiData<Tag[]>("/api/tags");
}

export function getFriendLinks() {
	return apiData<FriendLink[]>("/api/friend-links?is_visible=true");
}

export function getArticles() {
	return apiData<ArticleListItem[]>("/api/articles");
}

export function getArticle(id: number) {
	return apiData<ArticleDetail>(`/api/articles/${id}`);
}
