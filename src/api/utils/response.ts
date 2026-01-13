import { formatInTimeZone } from "date-fns-tz";
import type { Context } from "hono";

export interface SuccessResponse<T = unknown> {
	code: number;
	msg: string;
	data: T;
	count?: number;
}

export interface ErrorResponse {
	code: number;
	msg: string;
}

type ResponseError = {
	message?: string;
	details?: string;
} | null;

type ResultOptions<T> =
	| string[]
	| ((data: NonNullable<T>) => T | NonNullable<T>);

const DEFAULT_TIME_FIELDS = ["created_at", "updated_at"];

const formatTimestamps = (value: unknown, timeFields: string[]): unknown => {
	if (value === null || value === undefined) return value;

	if (Array.isArray(value)) {
		return value.map((item) => formatTimestamps(item, timeFields));
	}

	if (typeof value === "object") {
		const formattedEntries = Object.entries(
			value as Record<string, unknown>,
		).map(([key, fieldValue]) => {
			if (timeFields.includes(key) && fieldValue) {
				try {
					const formatted = formatInTimeZone(
						new Date(fieldValue as string),
						"Asia/Shanghai",
						"yyyy-MM-dd HH:mm:ss",
					);
					return [key, formatted];
				} catch {
					return [key, fieldValue];
				}
			}

			if (
				fieldValue &&
				(typeof fieldValue === "object" || Array.isArray(fieldValue))
			) {
				return [key, formatTimestamps(fieldValue, timeFields)];
			}

			return [key, fieldValue];
		});

		return Object.fromEntries(formattedEntries);
	}

	return value;
};

const normalizeErrorMessage = (error: ResponseError) => {
	if (!error) return "Database error";

	const base = error.message || "Database error";
	return error.details ? `${base} · [${error.details}]` : base;
};

/**
 * Unified result handler
 */
export const result = {
	ok<T>(c: Context, data: T, msg = "Success", count?: number | null) {
		const response: SuccessResponse<T> = {
			code: 200,
			msg,
			data,
		};
		if (count !== undefined && count !== null) response.count = count;
		return c.json<SuccessResponse<T>>(response, 200);
	},
	from<T>(
		c: Context,
		response: {
			data: T | null;
			error: ResponseError;
			count?: number | null;
			statusText?: string;
		},
		options?: ResultOptions<T>,
	) {
		if (response.error) {
			return result.error(c, normalizeErrorMessage(response.error));
		}

		const timeFields = Array.isArray(options) ? options : DEFAULT_TIME_FIELDS;
		const transformer = typeof options === "function" ? options : undefined;

		let data: T | null = response.data;
		data = formatTimestamps(data, timeFields) as T | null;

		if (transformer && data) {
			data = transformer(data as NonNullable<T>);
		}

		return result.ok(c, data, response.statusText || "Success", response.count);
	},
	error(c: Context, msg: string, status = 500) {
		return c.json<ErrorResponse>(
			{
				code: status,
				msg,
			},
			status,
		);
	},
};
