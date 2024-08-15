"use server"

import { fetchMutation } from "convex/nextjs"
import { ConvexError } from "convex/values"
import { redirect } from "next/navigation"
import { api } from "../../../../convex/_generated/api"
import { getAuthToken } from "../../auth"

export async function createOrg(
  _error: string | void | null,
  formData: FormData,
) {
  const token = await getAuthToken()
  let newOrgId: string
  try {
    newOrgId = await fetchMutation(
      api.orgs.create,
      {
        name: formData.get("name") as string,
      },
      { token },
    )
  } catch (error) {
    console.error(error)
    if (error instanceof ConvexError) return error.message
    return "An error occurred"
  }
  redirect(`/org/${newOrgId}/structures`)
}
