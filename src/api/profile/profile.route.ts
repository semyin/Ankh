export { app as profileRoute }

import { createApp } from '@/api/utils'
import { result } from '@/api/utils/response'

const app = createApp()

const CACHE_KEY = 'profile'
const CACHE_TTL = 86400 // 1天

app.get('/', async (c) => {
  const supabase = c.get('supabase')

  // 1. 尝试从缓存读取
  const cached = await c.env.KV.get(CACHE_KEY)
  if (cached) {
    return result.ok(c, JSON.parse(cached))
  }

  // 2. 缓存未命中，从数据库读取
  const response = await supabase.from('profile').select('*').single()

  // 3. 写入缓存
  if (response.data) {
    await c.env.KV.put(CACHE_KEY, JSON.stringify(response.data), { expirationTtl: CACHE_TTL })
  }

  return result.from(c, response, ['run_time', 'created_at', 'updated_at'])
})

app.put('/', async (c) => {
  const supabase = c.get('supabase')
  const body = await c.req.json()

  // 1. 更新数据库
  const response = await supabase.from('profile').update(body).eq('id', 1).select().single()

  // 2. 清除缓存
  await c.env.KV.delete(CACHE_KEY)

  return result.from(c, response, ['run_time', 'created_at', 'updated_at'])
})
