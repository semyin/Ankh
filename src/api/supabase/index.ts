import { createClient } from "@supabase/supabase-js";

export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: "13.0.5";
	};
	public: {
		Tables: {
			article: {
				Row: {
					author_id: string | null;
					category_id: number | null;
					comment_count: number;
					content: string;
					cover_image: string | null;
					created_at: string;
					id: number;
					is_published: boolean;
					is_top: boolean;
					like_count: number;
					summary: string | null;
					title: string;
					updated_at: string;
					view_count: number;
				};
				Insert: {
					author_id?: string | null;
					category_id?: number | null;
					comment_count?: number;
					content: string;
					cover_image?: string | null;
					created_at?: string;
					id?: number;
					is_published?: boolean;
					is_top?: boolean;
					like_count?: number;
					summary?: string | null;
					title: string;
					updated_at?: string;
					view_count?: number;
				};
				Update: {
					author_id?: string | null;
					category_id?: number | null;
					comment_count?: number;
					content?: string;
					cover_image?: string | null;
					created_at?: string;
					id?: number;
					is_published?: boolean;
					is_top?: boolean;
					like_count?: number;
					summary?: string | null;
					title?: string;
					updated_at?: string;
					view_count?: number;
				};
				Relationships: [
					{
						foreignKeyName: "article_category_id_fkey";
						columns: ["category_id"];
						isOneToOne: false;
						referencedRelation: "category";
						referencedColumns: ["id"];
					},
				];
			};
			article_tag: {
				Row: {
					article_id: number;
					tag_id: number;
				};
				Insert: {
					article_id: number;
					tag_id: number;
				};
				Update: {
					article_id?: number;
					tag_id?: number;
				};
				Relationships: [
					{
						foreignKeyName: "article_tag_article_id_fkey";
						columns: ["article_id"];
						isOneToOne: false;
						referencedRelation: "article";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "article_tag_tag_id_fkey";
						columns: ["tag_id"];
						isOneToOne: false;
						referencedRelation: "tag";
						referencedColumns: ["id"];
					},
				];
			};
			brief: {
				Row: {
					author_id: string;
					comment_count: number;
					content: string;
					created_at: string;
					id: number;
					is_published: boolean;
					like_count: number;
					updated_at: string;
					view_count: number;
				};
				Insert: {
					author_id?: string;
					comment_count?: number;
					content: string;
					created_at?: string;
					id?: number;
					is_published?: boolean;
					like_count?: number;
					updated_at?: string;
					view_count?: number;
				};
				Update: {
					author_id?: string;
					comment_count?: number;
					content?: string;
					created_at?: string;
					id?: number;
					is_published?: boolean;
					like_count?: number;
					updated_at?: string;
					view_count?: number;
				};
				Relationships: [];
			};
			category: {
				Row: {
					created_at: string;
					description: string | null;
					emoji: string | null;
					id: number;
					name: string;
					updated_at: string;
				};
				Insert: {
					created_at?: string;
					description?: string | null;
					emoji?: string | null;
					id?: number;
					name: string;
					updated_at?: string;
				};
				Update: {
					created_at?: string;
					description?: string | null;
					emoji?: string | null;
					id?: number;
					name?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			friend_link: {
				Row: {
					avatar_url: string | null;
					created_at: string;
					description: string | null;
					id: number;
					is_visible: boolean;
					name: string;
					sort_weight: number;
					type: string | null;
					updated_at: string;
					url: string;
				};
				Insert: {
					avatar_url?: string | null;
					created_at?: string;
					description?: string | null;
					id?: number;
					is_visible?: boolean;
					name: string;
					sort_weight?: number;
					type?: string | null;
					updated_at?: string;
					url: string;
				};
				Update: {
					avatar_url?: string | null;
					created_at?: string;
					description?: string | null;
					id?: number;
					is_visible?: boolean;
					name?: string;
					sort_weight?: number;
					type?: string | null;
					updated_at?: string;
					url?: string;
				};
				Relationships: [];
			};
			meta: {
				Row: {
					content: string | null;
					created_at: string;
					id: number;
					is_default: boolean;
					name: string | null;
					property: string | null;
					resource_id: number | null;
					resource_type: string | null;
					updated_at: string;
				};
				Insert: {
					content?: string | null;
					created_at?: string;
					id?: number;
					is_default?: boolean;
					name?: string | null;
					property?: string | null;
					resource_id?: number | null;
					resource_type?: string | null;
					updated_at?: string;
				};
				Update: {
					content?: string | null;
					created_at?: string;
					id?: number;
					is_default?: boolean;
					name?: string | null;
					property?: string | null;
					resource_id?: number | null;
					resource_type?: string | null;
					updated_at?: string;
				};
				Relationships: [];
			};
			profile: {
				Row: {
					about_content: string | null;
					author_name: string | null;
					avatar_url: string | null;
					bio: string | null;
					contacts: Json | null;
					copyright: string | null;
					created_at: string | null;
					description: string | null;
					icp: string | null;
					id: number;
					location: string | null;
					name: string;
					run_time: string | null;
					skills: Json | null;
					updated_at: string | null;
					url: string;
				};
				Insert: {
					about_content?: string | null;
					author_name?: string | null;
					avatar_url?: string | null;
					bio?: string | null;
					contacts?: Json | null;
					copyright?: string | null;
					created_at?: string | null;
					description?: string | null;
					icp?: string | null;
					id?: number;
					location?: string | null;
					name: string;
					run_time?: string | null;
					skills?: Json | null;
					updated_at?: string | null;
					url: string;
				};
				Update: {
					about_content?: string | null;
					author_name?: string | null;
					avatar_url?: string | null;
					bio?: string | null;
					contacts?: Json | null;
					copyright?: string | null;
					created_at?: string | null;
					description?: string | null;
					icp?: string | null;
					id?: number;
					location?: string | null;
					name?: string;
					run_time?: string | null;
					skills?: Json | null;
					updated_at?: string | null;
					url?: string;
				};
				Relationships: [];
			};
			tag: {
				Row: {
					created_at: string;
					id: number;
					img_url: string | null;
					name: string;
					updated_at: string;
					usage_count: number | null;
				};
				Insert: {
					created_at?: string;
					id?: number;
					img_url?: string | null;
					name: string;
					updated_at?: string;
					usage_count?: number | null;
				};
				Update: {
					created_at?: string;
					id?: number;
					img_url?: string | null;
					name?: string;
					updated_at?: string;
					usage_count?: number | null;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			can_edit_article: {
				Args: { article_id_param: number };
				Returns: boolean;
			};
			is_admin: { Args: never; Returns: boolean };
		};
		Enums: {
			article_type: "article" | "about" | "privacy";
			like_target_type: "article" | "brief";
			notification_type: "comment" | "like" | "reply";
			target_type: "article" | "brief" | "comment";
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
	keyof Database,
	"public"
>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	public: {
		Enums: {
			article_type: ["article", "about", "privacy"],
			like_target_type: ["article", "brief"],
			notification_type: ["comment", "like", "reply"],
			target_type: ["article", "brief", "comment"],
		},
	},
} as const;

type InitOptions = {
	auth?: {
		persistSession?: boolean;
	};
	global?: {
		headers?: Record<string, string>;
	};
};

export function initSupabase(options?: InitOptions) {
	return createClient<Database>(
		process.env.SUPABASE_URL,
		process.env.SUPABASE_KEY,
		{
			global: {
				headers: options?.global?.headers,
			},
		},
	);
}

export type SupabaseClient = ReturnType<typeof initSupabase>;
