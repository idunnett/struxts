import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { superValidate } from 'sveltekit-superforms/server'
import { initUserSchema } from './schemas'
import { redirect, setFlash } from 'sveltekit-flash-message/server'

export const load: PageServerLoad = async ({ url, locals }) => {
  const searchParams = url.searchParams
  const accessToken = searchParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token')
  const expiresIn = searchParams.get('expires_in')
  const tokenType = searchParams.get('token_type')
  const type = searchParams.get('type')

  if (!accessToken || !refreshToken) throw redirect(301, '/')

  const { data, error } = await locals.supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  if (error) {
    console.error(error)
    throw redirect(301, '/')
  }

  const form = await superValidate(initUserSchema)

  return { session: data, form }
}

export const actions: Actions = {
  default: async (event) => {
    const { request, locals } = event
    const form = await superValidate(request, initUserSchema)

    if (!form.valid) return fail(400, { form })

    const { data: userData, error: userError } =
      await locals.supabase.auth.updateUser({
        password: form.data.password,
      })

    if (userError) {
      console.error(userError)
      throw redirect(
        '/',
        {
          type: 'error',
          message: 'There was an error setting your password.',
        },
        event
      )
    }

    setFlash(
      {
        type: 'success',
        message: 'Your password has been set!',
      },
      event
    )

    const { error: profileError } = await locals.supabase
      .from('profiles')
      .update({
        full_name: form.data.fullName,
      })
      .eq('id', userData.user.id)

    if (profileError) {
      console.error(profileError)
      throw redirect(
        '/',
        {
          type: 'error',
          message: 'There was an error setting your full name.',
        },
        event
      )
    }

    throw redirect(
      '/',
      {
        type: 'success',
        message: 'Your profile has been updated!',
      },
      event
    )
  },
}
