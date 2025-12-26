import { format } from "date-fns";
import type { MiddlewareHandler } from "hono";

const logger: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  const time = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  const method = c.req.method;
  const url = new URL(c.req.url);
  const path = url.pathname;
  const requestId = crypto.randomUUID();

  // 记录请求
  const logParts = [`[${time}]`, `[${requestId.slice(0, 8)}]`, method, path];

  if (method === 'GET' && url.search) {
    logParts.push(url.search);
  }

  console.log(logParts.join(' '));

  // 记录请求体（非 GET 且非文件上传）
  if (method !== 'GET' && method !== 'HEAD') {
    const contentType = c.req.header('content-type');
    if (contentType?.includes('application/json')) {
      try {
        const body = await c.req.raw.clone().json();
        console.log('  BODY:', JSON.stringify(body, null, 0));
      } catch { }
    }
  }

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  // 状态码标记
  let statusMark = '';
  if (status >= 500) statusMark = '❌';
  else if (status >= 400) statusMark = '⚠️';
  else if (status >= 300) statusMark = '➡️';
  else statusMark = '✅';

  // 慢请求警告
  const durationMark = duration > 1000 ? '🐌' : '';

  // 打印响应体（JSON）
  const resContentType = c.res.headers.get('content-type');
  if (resContentType?.includes('application/json')) {
    try {
      const resBody = await c.res.clone().json();
      console.log('  RESPONSE:', JSON.stringify(resBody, null, 0));
    } catch { }
  }

  process.stdout.write(`  ${statusMark} ${status} ${duration}ms ${durationMark}\n`);
}

export { logger };
