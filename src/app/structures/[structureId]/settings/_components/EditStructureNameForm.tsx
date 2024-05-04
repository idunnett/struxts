"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import Spinner from "~/components/Spinner"
import {
  type FormEvent,
  useState,
  useTransition,
  useMemo,
  useEffect,
} from "react"
import { api } from "~/trpc/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Props {
  structure: {
    id: number
    name: string
  }
}

export default function EditStructureNameForm({ structure }: Props) {
  const [structureName, setStructureName] = useState(structure.name)
  const router = useRouter()
  const [isTransitionStarted, startTransition] = useTransition()

  const updateStructureName = api.structure.updateName.useMutation({
    onSettled: () => startTransition(() => router.refresh()),
    onError: (error) => toast.error(error.message),
  })

  const isUpdating = useMemo(
    () => updateStructureName.isPending || isTransitionStarted,
    [updateStructureName.isPending, isTransitionStarted],
  )

  useEffect(() => setStructureName(structure.name), [structure.name])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    updateStructureName.mutate({
      structureId: structure.id,
      name: structureName,
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
                disabled={isUpdating}
                value={structureName}
                onChange={(e) => setStructureName(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button disabled={isUpdating || structure.name === structureName}>
            {isUpdating && <Spinner className="mr-2" />}
            Save
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
