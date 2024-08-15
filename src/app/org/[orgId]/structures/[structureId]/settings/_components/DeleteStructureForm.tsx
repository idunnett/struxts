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
import { useState } from "react"
import { api } from "~/trpc/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"

interface Props {
  structureId: number
}

export default function DeleteStructureForm({ structureId }: Props) {
  const router = useRouter()
  const [verifyText, setVerifyText] = useState("")

  const deleteStructure = api.structure.delete.useMutation({
    onSuccess: () => {
      router.replace("/structures")
      router.refresh()
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Delete Structure</CardTitle>
        <CardDescription>
          The structure will be permanently deleted, for all members. This
          action is irreversible and can not be undone.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="destructive">
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" forceMount>
            <DialogHeader>
              <DialogTitle>Delete Structure</DialogTitle>
              <DialogDescription>
                The structure will be permanently deleted, for all members. This
                action is irreversible and can not be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 py-2">
              <p className="text-sm">
                To verify, type <b>delete this structure</b> below:
              </p>
              <Input
                autoFocus
                value={verifyText}
                onChange={(e) => setVerifyText(e.target.value)}
              />
            </div>
            <DialogFooter className="gap-2">
              <DialogClose type="button">Cancel</DialogClose>
              <Button
                variant="destructive"
                disabled={
                  deleteStructure.isPending ||
                  verifyText !== "delete this structure"
                }
                onClick={() => deleteStructure.mutate({ structureId })}
              >
                {deleteStructure.isPending && <Spinner className="mr-2" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
