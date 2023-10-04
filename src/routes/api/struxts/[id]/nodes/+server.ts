import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$lib/server/db'
import { nodesTable, profileStruxtsTable } from '$lib/server/db/schema'
import { and, eq } from 'drizzle-orm'
import { redirect } from 'sveltekit-flash-message/server'

export const POST: RequestHandler = async (event) => {
  const { request, params, locals } = event
  const session = await locals.getSession()
  if (!session) return json({ message: 'Unauthorized' }, { status: 401 })

  const struxtId = parseInt(params.id)
  const struxt = await db.query.profileStruxtsTable.findFirst({
    where: and(
      eq(profileStruxtsTable.struxtId, struxtId),
      eq(profileStruxtsTable.userId, session.user.id)
    ),
  })
  if (!struxt)
    throw redirect(
      '/',
      {
        message: 'You do not have access to this structure',
        type: 'error',
      },
      event
    )
  const { x, y, type } = await request.json()

  if (typeof x !== 'number' || typeof y !== 'number')
    throw error(400, 'Invalid input')

  const res = await db
    .insert(nodesTable)
    .values({ x, y, type, struxtId })
    .returning({ id: nodesTable.id })

  return json(res[0])
}
