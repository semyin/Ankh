export { app as friendLinkRoute }

import { createApp } from '@/api/utils'
import { result } from '@/api/utils/response'

const app = createApp()

app.get('/', async (c) => {
  const supabase = c.get('supabase')
  const { is_visible } = c.req.query()

  const response = await supabase
    .from('friend_link')
    .select('*')
    .eq('is_visible', is_visible === 'true')
    .order('sort_weight', { ascending: false })
    .order('created_at', { ascending: false })

  return result.from(c, response)
})

app.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const supabase = c.get('supabase')

  const response = await supabase.from('friend_link').select('*').eq('id', id).single()

  return result.from(c, response)
})

app.post('/', async (c) => {
  const supabase = c.get('supabase')
  const body = await c.req.json()

  const response = await supabase.from('friend_link').insert(body).select().single()

  return result.from(c, response)
})

app.put('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const supabase = c.get('supabase')
  const body = await c.req.json()

  const response = await supabase.from('friend_link').update(body).eq('id', id).select().single()

  return result.from(c, response)
})

app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const supabase = c.get('supabase')

  const response = await supabase.from('friend_link').delete().eq('id', id).select().single()

  return result.from(c, response)
})

app.patch('/:id/visibility', async (c) => {
  const id = Number(c.req.param('id'))
  const supabase = c.get('supabase')
  const { is_visible } = await c.req.json<{ is_visible: boolean }>()

  const response = await supabase.from('friend_link').update({ is_visible }).eq('id', id).select().single()

  return result.from(c, response)
})
