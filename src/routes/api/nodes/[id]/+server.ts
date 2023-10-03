import { db } from '$lib/server/db'
import { nodesTable } from '$lib/server/db/schema'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { eq } from 'drizzle-orm'

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  const session = await locals.getSession()
  if (!session) return json({ message: 'Unauthorized' }, { status: 401 })
  const id = parseInt(params.id)
  if (isNaN(id)) return json({ error: 'Invalid ID format' }, { status: 400 })
  const data = await request.json()

  const node = await db.query.nodesTable.findFirst({
    where: eq(nodesTable.id, id),
  })
  if (!node) return json({ error: 'Node not found' }, { status: 404 })

  await db.update(nodesTable).set(data).where(eq(nodesTable.id, id))

  return json({})
}
