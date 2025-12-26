export { app as authRoute }

import { deleteCookie, setCookie } from "hono/cookie";
import { createApp } from "@/api/utils";
import { result } from "@/api/utils/response";

const app = createApp()

app.post('/login', async (c) => {
  const supabase = c.get('supabase')
  const body = await c.req.json()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password
  })
  
  if (error) {
    return result.error(c, error.message || 'Login failed', 401)
  }

  setCookie(c, 'access_token', data.session.access_token, {
    httpOnly: true,
    secure: import.meta.env.PROD ? true : false, // 生产环境使用 HTTPS
    maxAge: data.session.expires_in // 7 天
  })

  return result.from(c, { data, error })
})

app.post('/logout', async (c) => {
  deleteCookie(c, 'access_token')
  return result.ok(c, null, '退出成功')
})

