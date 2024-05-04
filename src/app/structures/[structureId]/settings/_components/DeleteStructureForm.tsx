"use client"

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import Spinner from "~/components/Spinner"
import { type FormEvent } from "react"
import { api } from "~/trpc/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Props {
  structureId: number
}

export default function DeleteStructureForm({ structureId }: Props) {
  const router = useRouter()

  const deleteStructure = api.structure.delete.useMutation({
    onSuccess: () => router.replace("/structures"),
    onError: (error) => toast.error(error.message),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    deleteStructure.mutate({ structureId })
  }

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Delete Structure</CardTitle>
          <CardDescription>
            The structure will be permanently deleted, for all members. This
            action is irreversible and can not be undone.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-end">
          <Button variant="destructive" disabled={deleteStructure.isPending}>
            {deleteStructure.isPending && <Spinner className="mr-2" />}
            Delete
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
