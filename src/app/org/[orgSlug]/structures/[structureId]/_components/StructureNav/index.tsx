"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { Suspense, useState } from "react"
import { api } from "../../../../../../../../convex/_generated/api"
import Spinner from "../../../../../../../components/Spinner"
import {
  Button,
  buttonVariants,
} from "../../../../../../../components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../../../../components/ui/dialog"
import { usePrefetchedAuthQuery } from "../../../../../../../hooks/usePrefetchedQuery"
import InviteMemberForm from "./InviteMemberForm"

interface Props {
  prefetchedStructure: typeof api.structures.getById._returnType
}

export default function StructureNav({ prefetchedStructure }: Props) {
  const { orgSlug, structureId } = useParams() as {
    orgSlug: string
    structureId: string
  }
  const structure = usePrefetchedAuthQuery(
    api.structures.getById,
    prefetchedStructure,
    { id: structureId },
  )

  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [manageMembersDialogOpen, setManageMembersDialogOpen] = useState(false)

  const pathname = usePathname()

  if (!structure) return null

  return (
    <>
      <div className="border-b bg-card px-4 py-1">
        <div className="flex flex-initial items-center gap-4">
          <div className="relative">
            <Link
              href={`/org/${orgSlug}/structures/${structure._id}`}
              className={buttonVariants({
                variant: "ghost",
                className: "h-8",
              })}
            >
              Structure
            </Link>
            {pathname === `/structures/${structure._id}` && (
              <div className="absolute top-full h-[1px] w-full translate-y-1 bg-primary" />
            )}
          </div>
          {/* <MembersMenuItem
            structureId={structure._id}
            currentStructureUser={currentStructureUser}
            onAddMember={() => setAddMemberDialogOpen(true)}
            onManageMembers={() => setManageMembersDialogOpen(true)}
          /> */}
          {/* {isOwner(currentStructureUser.role) && (
            <div className="relative">
              <Link
                href={`/structures/${structure._id}/settings`}
                className={buttonVariants({
                  variant: "ghost",
                  className: "h-8",
                })}
              >
                Settings
              </Link>
              {pathname === `/structures/${structure._id}/settings` && (
                <div className="absolute top-full h-[1px] w-full translate-y-1 bg-primary" />
              )}
            </div>
          )} */}
        </div>
      </div>
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite a Member</DialogTitle>
          </DialogHeader>
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <Spinner />
              </div>
            }
          >
            <InviteMemberForm structureId={structure._id} />
          </Suspense>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={manageMembersDialogOpen}
        onOpenChange={setManageMembersDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Structure Members</DialogTitle>
          </DialogHeader>
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <Spinner />
              </div>
            }
          >
            {/* <ManageMembers structureId={structure._id} /> */}
          </Suspense>
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
  )
}
