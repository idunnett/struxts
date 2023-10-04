import { redirect } from 'sveltekit-flash-message/server'
import type { Actions, PageServerLoad } from './$types'
import { superValidate } from 'sveltekit-superforms/server'
import { newStruxtSchema } from './schemas'
import { fail } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { profileStruxtsTable, struxtsTable } from '$lib/server/db/schema'

export const load: PageServerLoad = async (event) => {
  const { locals } = event
  const session = await locals.getSession()
  if (!session) throw redirect('/auth/login', undefined, event)

  const newStruxtForm = await superValidate(newStruxtSchema)

  return {
    newStruxtForm,
  }
}

export const actions: Actions = {
  default: async (event) => {
    const { locals, request } = event
    const session = await locals.getSession()
    if (!session) throw redirect('/auth/login', undefined, event)

    const form = await superValidate(request, newStruxtSchema)
    if (!form.valid) return fail(400, { form })

    const title = form.data.title

    const newStruxtId = await db.transaction(async (tx) => {
      const newStruxts = await tx
        .insert(struxtsTable)
        .values({
          title,
          description: '',
        })
        .returning()
        .execute()
      const newStruxt = newStruxts[0]

      await tx.insert(profileStruxtsTable).values({
        struxtId: newStruxt.id,
        userId: session.user.id,
      })

      return newStruxt.id
    })

    throw redirect(`/${newStruxtId}`, undefined, event)
  },
}
