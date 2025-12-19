import { Hono } from 'hono'
import type { Context } from 'hono'

// 创建 todos 路由
const todos = new Hono()

// 模拟数据存储
let todoList = [
  { id: 1, title: '学习 Hono.js', completed: false },
  { id: 2, title: '部署到 Cloudflare', completed: false },
  { id: 3, title: '集成 TanStack Start', completed: true }
]

// 获取所有 todos
todos.get('/', (c: Context) => {
  return c.json({ todos: todoList })
})

// 获取单个 todo
todos.get('/:id', (c: Context) => {
  const id = Number.parseInt(c.req.param('id'))
  const todo = todoList.find(t => t.id === id)

  if (!todo) {
    return c.json({ error: 'Todo not found' }, 404)
  }

  return c.json({ todo })
})

// 创建新 todo
todos.post('/', async (c: Context) => {
  const body = await c.req.json()
  const newTodo = {
    id: todoList.length + 1,
    title: body.title,
    completed: false
  }

  todoList.push(newTodo)
  return c.json({ todo: newTodo }, 201)
})

// 更新 todo
todos.put('/:id', async (c: Context) => {
  const id = Number.parseInt(c.req.param('id'))
  const body = await c.req.json()
  const todoIndex = todoList.findIndex(t => t.id === id)

  if (todoIndex === -1) {
    return c.json({ error: 'Todo not found' }, 404)
  }

  todoList[todoIndex] = { ...todoList[todoIndex], ...body }
  return c.json({ todo: todoList[todoIndex] })
})

// 删除 todo
todos.delete('/:id', (c: Context) => {
  const id = Number.parseInt(c.req.param('id'))
  const todoIndex = todoList.findIndex(t => t.id === id)

  if (todoIndex === -1) {
    return c.json({ error: 'Todo not found' }, 404)
  }

  todoList = todoList.filter(t => t.id !== id)
  return c.json({ message: 'Todo deleted successfully' })
})

export default todos
