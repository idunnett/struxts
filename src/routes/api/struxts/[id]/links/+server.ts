import { db } from '$lib/server/db'
import {
  hLinksTable,
  nodesTable,
  profileStruxtsTable,
} from '$lib/server/db/schema'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { and, eq } from 'drizzle-orm'
import { redirect } from 'sveltekit-flash-message/server'

export const POST: RequestHandler = async (event) => {
  const { params, request, locals } = event
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

  const { leftId, rightId } = await request.json()

  const linkExists = await db.query.hLinksTable.findFirst({
    where: and(
      eq(hLinksTable.leftId, leftId),
      eq(hLinksTable.rightId, rightId),
      eq(hLinksTable.struxtId, struxtId)
    ),
  })
  if (linkExists) return json({ error: 'Link already exists' }, { status: 400 })

  const newLink = await db
    .insert(hLinksTable)
    .values({
      leftId,
      rightId,
      struxtId,
    })
    .returning()

  return json(newLink[0])
}
