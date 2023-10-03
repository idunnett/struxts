import { db } from '$lib/server/db'
import { nodesTable } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import type { Actions, PageServerLoad } from './$types'
import { fail, redirect } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms/server'
import { newNodeSchema } from '$lib/components/NodeEditDrawer/schemas'

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession()
  if (!session) throw redirect(303, '/login')
  const nodes = await db.select().from(nodesTable)
  const newNodeForm = await superValidate(newNodeSchema)
  return {
    nodes,
    newNodeForm,
  }
}

export const actions: Actions = {
  update: async ({ request }) => {
    const form = await superValidate(request, newNodeSchema)
    if (!form.valid) return fail(400, { form })

    const id = form.data.id
    const title = form.data.title

    const node = await db.query.nodesTable.findFirst({
      where: eq(nodesTable.id, id),
    })

    if (!node) return fail(404)

    await db
      .update(nodesTable)
      .set({
        title,
      })
      .where(eq(nodesTable.id, id))

    return
  },
}
