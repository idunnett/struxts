"use client"

import MembersMenuItem from "./MembersMenuItem"
import { Suspense, useState } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import Spinner from "~/components/Spinner"
import ManageMembers from "./ManageMembers"
import { Button, buttonVariants } from "~/components/ui/button"
import InviteMemberForm from "../InviteMemberForm"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { isOwner } from "~/lib/utils"

interface Props {
  structure: {
    id: number
    name: string
  }
  currentStructureUser: {
    role: string
    userId: string
  }
}

export default function StructureNav({
  structure,
  currentStructureUser,
}: Props) {
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [manageMembersDialogOpen, setManageMembersDialogOpen] = useState(false)

  const pathname = usePathname()

  return (
    <>
      <div className="border-b px-4 py-1">
        <div className="flex flex-initial items-center gap-4">
          <div className="relative">
            <Link
              href={`/structures/${structure.id}`}
              className={buttonVariants({
                variant: "ghost",
              })}
            >
              Structure
            </Link>
            {pathname === `/structures/${structure.id}` && (
              <div className="absolute top-full h-[1px] w-full translate-y-1 bg-primary" />
            )}
          </div>
          <MembersMenuItem
            structureId={structure.id}
            currentStructureUser={currentStructureUser}
            onAddMember={() => setAddMemberDialogOpen(true)}
            onManageMembers={() => setManageMembersDialogOpen(true)}
          />
          {isOwner(currentStructureUser.role) && (
            <div className="relative">
              <Link
                href={`/structures/${structure.id}/settings`}
                className={buttonVariants({
                  variant: "ghost",
                })}
              >
                Settings
              </Link>
              {pathname === `/structures/${structure.id}/settings` && (
                <div className="absolute top-full h-[1px] w-full translate-y-1 bg-primary" />
              )}
            </div>
          )}
        </div>
      </div>
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite a Member to {structure.name}</DialogTitle>
          </DialogHeader>
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <Spinner />
              </div>
            }
          >
            <InviteMemberForm structureId={structure.id} />
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
            <ManageMembers structureId={structure.id} />
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
