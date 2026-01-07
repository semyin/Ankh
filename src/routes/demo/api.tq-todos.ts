import { createFileRoute } from '@tanstack/react-router'

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const randomDelay = (min = 300, max = 1500) =>
  new Promise((resolve) =>
    setTimeout(resolve, Math.random() * (max - min) + min)
  )


const todos = [
  {
    id: 1,
    name: 'Buy groceries',
  },
  {
    id: 2,
    name: 'Buy mobile phone',
  },
  {
    id: 3,
    name: 'Buy laptop',
  },
]

export const Route = createFileRoute('/demo/api/tq-todos')({
  server: {
    handlers: {
      GET: async () => {
        await delay(2000 * 2)
        return Response.json(todos)
      },
      POST: async ({ request }) => {
        const name = await request.json()
        const todo = {
          id: todos.length + 1,
          name,
        }
        todos.push(todo)
        return Response.json(todo)
      },
    },
  },
})
