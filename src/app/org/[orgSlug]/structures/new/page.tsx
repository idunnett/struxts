"use client"

import { useMutation } from "convex/react"
import { useRouter } from "next/navigation"
import { FormEvent, useState, useTransition } from "react"
import { api } from "../../../../../../convex/_generated/api"
import Spinner from "../../../../../components/Spinner"
import { Button } from "../../../../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card"
import { Input } from "../../../../../components/ui/input"
import { Label } from "../../../../../components/ui/label"
import { useCurrentOrg } from "~/hooks/useCurrentOrg"

export default function NewStructurePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const { org, orgId, orgSlug, isLoaded } = useCurrentOrg()
  const [isPending, startTransition] = useTransition()
  const createStructure = useMutation(api.structures.create)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(async () => {
      if (!orgId || !orgSlug) return
      const structureId = await createStructure({
        name,
        orgId,
      })
      router.replace(`/org/${orgSlug}/structures/${structureId}`)
    })
  }

  if (!isLoaded) return <Spinner />

  return (
    <div className="container mx-auto flex h-full w-full items-center justify-center">
      <form onSubmit={handleSubmit}>
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Create Structure</CardTitle>
            <CardDescription>
              Create a new structure in{" "}
              <b className="text-primary">{org?.name}</b>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Name of your structure"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button disabled={isPending || !orgId}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
