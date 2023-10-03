import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { superValidate } from 'sveltekit-superforms/server'
import { loginSchema } from './schemas'

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession()
  if (session) throw redirect(303, '/')
  const loginForm = await superValidate(loginSchema)
  return {
    loginForm,
  }
}

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await superValidate(request, loginSchema)
    if (!form.valid) return fail(400, { form })

    const email = form.data.email
    const password = form.data.password

    const { error } = await locals.supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) return fail(400, { error })

    throw redirect(303, '/')
  },
}
