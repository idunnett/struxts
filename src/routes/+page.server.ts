import { db } from '$lib/server/db'
import { eq } from 'drizzle-orm'
import type { PageServerLoad } from './$types'
import { profileStruxtsTable } from '$lib/server/db/schema'
import { redirect } from 'sveltekit-flash-message/server'

export const load: PageServerLoad = async (event) => {
  const { locals } = event
  const session = await locals.getSession()
  if (!session) return

  const userStruxts = await db.query.profileStruxtsTable.findMany({
    where: eq(profileStruxtsTable.userId, session.user.id),
  })

  if (userStruxts.length === 0) throw redirect('/new', undefined, event)
  else {
    const struxtId = userStruxts[0].struxtId
    throw redirect(`/${struxtId}`, undefined, event)
  }

  return
}
