export { app as healthRouter };

import { createApp } from "@/api/utils";
import { result } from "@/api/utils/response";

export const app = createApp();

app.get("", (c) => {
	return result.from(
		c,
		{
			error: null,
			data: {
				timestamp: new Date().toISOString(),
			},
		},
		["timestamp"],
	);
});
