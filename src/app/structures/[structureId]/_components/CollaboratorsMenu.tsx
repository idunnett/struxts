import Image from "next/image"
import { Button } from "~/components/ui/button"
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
import { Label } from "~/components/ui/label"
import { Skeleton } from "~/components/ui/skeleton"
import { api } from "~/trpc/react"

interface Props {
  structureId: number
  structureName: string
}

export default function CollaboratorsMenu({
  structureId,
  structureName,
}: Props) {
  const { data, isPending } =
    api.structure.getCollaborators.useQuery(structureId)

  return (
    <div className="flex w-max flex-col gap-4 p-4">
      {isPending && <Skeleton className="h-[20px] w-[100px] rounded-full" />}
      {data && (
        <>
          <ul>
            {data.map((collaborator) => (
              <li
                key={collaborator.id}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Image
                  src={collaborator.imageUrl}
                  alt={
                    collaborator.fullName ?? "Structure Collaborator Picture"
                  }
                  className="rounded-full"
                  width={24}
                  height={24}
                />
                <span className="text-sm">
                  {collaborator.fullName ??
                    ((
                      (collaborator.firstName ?? "") +
                      " " +
                      (collaborator.lastName ?? "")
                    ).trim() ||
                      collaborator.emailAddresses[0]?.emailAddress)}
                </span>
              </li>
            ))}
          </ul>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                + Add Collaborator
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  Invite a Collaborator to {structureName}
                </DialogTitle>
                <DialogDescription>
                  Anyone who has this link will be able to view this.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="link" className="sr-only">
                    Link
                  </Label>
                  <Input
                    id="link"
                    type="email"
                    placeholder="example@email.com"
                  />
                </div>
                <Button type="submit" size="sm" className="px-3">
                  {/* <span className="sr-only">Copy</span>
                  <Copy className="h-4 w-4" /> */}
                  Invite
                </Button>
              </div>
              <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
