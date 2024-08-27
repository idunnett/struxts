"use client"

import { useAuth } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import Spinner from "~/components/Spinner"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
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
import { api } from "../../../../../../../../../convex/_generated/api"

interface Props {
  orgId: string | null
  structureId: string
}

export default function DeleteStructureForm({ orgId, structureId }: Props) {
  const session = useAuth()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [verifyText, setVerifyText] = useState("")
  const deleteStructure = useMutation(api.structures.remove)

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
          <DialogContent className="sm:max-w-md" heightStyle="auto" forceMount>
            <DialogHeader>
              <DialogTitle>Delete Structure</DialogTitle>
              <DialogDescription>
                The structure will be permanently deleted, for all members. This
                action is irreversible and can not be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 px-6 py-2">
              <p className="text-sm">
                To verify, type <b>delete this structure</b> below:
              </p>
              <Input
                autoFocus
                value={verifyText}
                onChange={(e) => setVerifyText(e.target.value)}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                disabled={verifyText !== "delete this structure"}
                onClick={() => {
                  startTransition(async () => {
                    await deleteStructure({ orgId, structureId })
                    router.replace(
                      `/org/${session.orgSlug ?? session.userId}/structures`,
                    )
                    router.refresh()
                  })
                }}
              >
                {isPending && <Spinner className="mr-2" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
