import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$lib/server/db'
import { and, eq } from 'drizzle-orm'
import { hLinksTable, profileStruxtsTable } from '$lib/server/db/schema'
import { redirect } from 'sveltekit-flash-message/server'

export const DELETE: RequestHandler = async (event) => {
  const { params, locals } = event
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

  const leftId = parseInt(params.leftId)
  const rightId = parseInt(params.rightId)
  if (isNaN(leftId) || isNaN(rightId))
    return json({ error: 'Invalid ID format' }, { status: 400 })

  await db
    .delete(hLinksTable)
    .where(
      and(
        eq(hLinksTable.leftId, leftId),
        eq(hLinksTable.rightId, rightId),
        eq(hLinksTable.struxtId, struxtId)
      )
    )

  return json({})
}
