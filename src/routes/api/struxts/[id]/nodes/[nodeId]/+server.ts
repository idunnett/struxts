import { db } from '$lib/server/db'
import { nodesTable, profileStruxtsTable } from '$lib/server/db/schema'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { and, eq } from 'drizzle-orm'
import { redirect } from 'sveltekit-flash-message/server'

export const PUT: RequestHandler = async (event) => {
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

  const nodeId = parseInt(params.nodeId)
  if (isNaN(nodeId))
    return json({ error: 'Invalid ID format' }, { status: 400 })
  const data = await request.json()

  const node = await db.query.nodesTable.findFirst({
    where: and(eq(nodesTable.id, nodeId), eq(nodesTable.struxtId, struxtId)),
  })
  if (!node) return json({ error: 'Node not found' }, { status: 404 })

  await db
    .update(nodesTable)
    .set(data)
    .where(and(eq(nodesTable.id, nodeId), eq(nodesTable.struxtId, struxtId)))

  return json({})
}

export const PATCH: RequestHandler = async (event) => {
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

  const nodeId = parseInt(params.nodeId)
  if (isNaN(nodeId))
    return json({ error: 'Invalid ID format' }, { status: 400 })
  const data = await request.json()

  const res = await db
    .update(nodesTable)
    .set(data)
    .where(and(eq(nodesTable.id, nodeId), eq(nodesTable.struxtId, struxtId)))
    .returning({
      id: nodesTable.id,
    })
  const { id } = res[0]
  return json(id)
}

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

  const nodeId = parseInt(params.nodeId)
  if (isNaN(nodeId))
    return json({ error: 'Invalid ID format' }, { status: 400 })

  await db
    .delete(nodesTable)
    .where(and(eq(nodesTable.id, nodeId), eq(nodesTable.struxtId, struxtId)))

  return json({})
}
