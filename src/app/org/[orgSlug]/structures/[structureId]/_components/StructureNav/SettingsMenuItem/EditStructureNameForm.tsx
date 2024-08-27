"use client"

import { useMutation } from "convex/react"
import { useRouter } from "next/navigation"
import { type FormEvent, useEffect, useState, useTransition } from "react"
import Spinner from "~/components/Spinner"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { api } from "../../../../../../../../../convex/_generated/api"
import { Doc } from "../../../../../../../../../convex/_generated/dataModel"

interface Props {
  orgId: string | null
  structure: Doc<"structures">
}

export default function EditStructureNameForm({ structure }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [structureName, setStructureName] = useState(structure.name)

  const updateStructureName = useMutation(api.structures.updateName)

  useEffect(() => setStructureName(structure.name), [structure.name])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await updateStructureName({
        orgId: structure.orgId,
        structureId: structure._id,
        name: structureName,
      })
      router.refresh()
    })
  }

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Structure Name</CardTitle>
          <CardDescription>Used to identify your Structure.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Name of your structure"
                disabled={isPending}
                value={structureName}
                onChange={(e) => setStructureName(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button disabled={isPending || structure.name === structureName}>
            {isPending && <Spinner className="mr-2" />}
            Save
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
