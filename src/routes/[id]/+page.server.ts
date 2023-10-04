import { db } from '$lib/server/db'
import { nodesTable, profileStruxtsTable } from '$lib/server/db/schema'
import { and, eq } from 'drizzle-orm'
import type { Actions, PageServerLoad } from './$types'
import { fail } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms/server'
import { newNodeSchema } from '$lib/components/NodeEditDrawer/schemas'
import { redirect } from 'sveltekit-flash-message/server'

export const load: PageServerLoad = async (event) => {
  const { locals, params } = event
  const session = await locals.getSession()
  if (!session) throw redirect(303, '/auth/login')

  const struxtId = parseInt(params.id)
  if (isNaN(struxtId))
    throw redirect('/', { message: 'Invalid struxt id', type: 'error' }, event)

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

  const nodes = await db
    .select()
    .from(nodesTable)
    .where(eq(nodesTable.struxtId, struxtId))
  const newNodeForm = await superValidate(newNodeSchema)
  return {
    struxtId,
    nodes,
    newNodeForm,
  }
}

export const actions: Actions = {
  update: async (event) => {
    const { request, params, locals } = event
    const session = await locals.getSession()
    if (!session) throw redirect(303, '/auth/login')

    const form = await superValidate(request, newNodeSchema)
    if (!form.valid) return fail(400, { form })

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

    const id = form.data.id
    const title = form.data.title
    const description = form.data.description

    const node = await db.query.nodesTable.findFirst({
      where: eq(nodesTable.id, id),
    })

    if (!node) return fail(404)

    await db
      .update(nodesTable)
      .set({
        title,
        description,
      })
      .where(eq(nodesTable.id, id))

    return
  },
}
