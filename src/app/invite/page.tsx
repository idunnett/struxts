import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { fetchMutation } from "convex/nextjs"
import { redirect } from "next/navigation"
import { api } from "../../../convex/_generated/api"
import ErrorDisplay from "../../components/ErrorDisplay"
import { Card } from "../../components/ui/card"
import { SignInFormPasswordAndVerifyViaCode } from "../sign-in/[[...rest]]/SignInFormPasswordAndVerifyViaCode"

export default async function InvitePage({
  searchParams,
}: {
  searchParams: { token: string }
}) {
  const token = searchParams.token
  const authToken = await convexAuthNextjsToken()

  if (!authToken) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Card className="w-full max-w-md p-4">
          <SignInFormPasswordAndVerifyViaCode refreshOnly />
        </Card>
      </div>
    )
  }

  let structureId: string | undefined

  try {
    structureId = await fetchMutation(
      api.invites.acceptInvite,
      {
        token: token,
      },
      { token: authToken },
    )
  } catch (error) {
    console.error(error)
    return <ErrorDisplay error={JSON.stringify(error)} />
  }

  if (!structureId)
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p className="text-2xl font-bold">Failed to join structure</p>
      </div>
    )

  redirect(`/structures/${structureId}`)
}
