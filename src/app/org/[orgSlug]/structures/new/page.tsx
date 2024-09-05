"use client"

import { ClerkLoaded, ClerkLoading, useOrganization } from "@clerk/nextjs"
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

export default function NewStructurePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const { organization } = useOrganization()
  const [isPending, startTransition] = useTransition()
  const createStructure = useMutation(api.structures.create)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(async () => {
      if (!organization) return
      const structureId = await createStructure({
        name,
        orgId: organization.id,
      })
      router.replace(`/org/${organization?.slug}/structures/${structureId}`)
    })
  }

  return (
    <div className="container mx-auto flex h-full w-full items-center justify-center">
      <ClerkLoading>
        <Spinner />
      </ClerkLoading>
      <ClerkLoaded>
        <form onSubmit={handleSubmit}>
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>Create Structure</CardTitle>
              <CardDescription>
                Create a new structure in{" "}
                <b className="text-primary">{organization?.name}</b>
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
              <Button disabled={isPending}>
                {isPending ? "Creating..." : "Create"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </ClerkLoaded>
    </div>
  )
}
