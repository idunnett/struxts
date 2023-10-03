import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$lib/server/db'
import { nodesTable } from '$lib/server/db/schema'

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.getSession()
  if (!session) return json({ message: 'Unauthorized' }, { status: 401 })
  const { x, y, type } = await request.json()

  if (typeof x !== 'number' || typeof y !== 'number')
    throw error(400, 'Invalid input')

  const res = await db
    .insert(nodesTable)
    .values({ x, y, type })
    .returning({ id: nodesTable.id })

  return json(res[0])
}
