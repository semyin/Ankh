import { formatInTimeZone } from "date-fns-tz";
import type { Context } from "hono";

export interface SuccessResponse<T = any> {
	code: number;
	msg: string;
	data: T;
	count?: number;
}

export interface ErrorResponse {
	code: number;
	msg: string;
}

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
			error: any;
			count?: number | null;
			statusText?: string;
		},
		options?: string[] | ((data: NonNullable<T>) => any),
	) {
		if (response.error) {
			let message = response.error.message;
			if (response.error.details) {
				message = response.error.message + " [" + response.error.details + "]";
			}
			return result.error(c, message || "Database error");
		}

		let data: any = response.data;

		// 格式化时间字段
		const timeFields = Array.isArray(options)
			? options
			: ["created_at", "updated_at"];

		const formatTime = (obj: any): any => {
			if (!obj) return obj;
			if (Array.isArray(obj)) return obj.map(formatTime);
			if (typeof obj === "object") {
				const result: any = {};
				for (const key in obj) {
					const value = obj[key];

					// 如果是时间字段，格式化
					if (timeFields.includes(key) && value) {
						try {
							result[key] = formatInTimeZone(
								new Date(value),
								"Asia/Shanghai",
								"yyyy-MM-dd HH:mm:ss",
							);
						} catch {
							result[key] = value;
						}
					}
					// 如果是对象或数组，递归处理
					else if (
						value &&
						(typeof value === "object" || Array.isArray(value))
					) {
						result[key] = formatTime(value);
					}
					// 其他值直接赋值
					else {
						result[key] = value;
					}
				}
				return result;
			}
			return obj;
		};

		// 格式化时间
		data = formatTime(data);

		// 执行自定义转换函数
		if (typeof options === "function") {
			data = data ? options(data) : data;
		}

		return result.ok(c, data, response.statusText || "Success", response.count);
	},
	error(c: Context, msg: string, status = 500) {
		return c.json<ErrorResponse>(
			{
				code: status,
				msg,
			},
			status as any,
		);
	},
};
