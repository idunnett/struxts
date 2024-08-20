"use client"

import { LucideCircleCheck, LucideRefreshCcw } from "lucide-react"
import { useParams } from "next/navigation"
import { Suspense, use, useState } from "react"
import { api } from "../../../../../../../../convex/_generated/api"
import Spinner from "../../../../../../../components/Spinner"
import { Button } from "../../../../../../../components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../../../../components/ui/dialog"
import { usePrefetchedAuthQuery } from "../../../../../../../hooks/usePrefetchedQuery"
import { StructureContext } from "../StructureProvider"
import InviteMemberForm from "./InviteMemberForm"

interface Props {
  prefetchedStructure: typeof api.structures.getById._returnType
}

export default function StructureNav({ prefetchedStructure }: Props) {
  const { structureId } = useParams() as { structureId: string }
  const structure = usePrefetchedAuthQuery(
    api.structures.getById,
    prefetchedStructure,
    { id: structureId },
  )

  const { isSaving } = use(StructureContext)

  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [manageMembersDialogOpen, setManageMembersDialogOpen] = useState(false)

  if (!structure) return null

  return (
    <>
      <div className="border-b bg-card px-8 py-1">
        <div className="flex flex-initial items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">{structure.name}</h1>
            <div className="flex items-center gap-1 pt-1 text-xs text-muted-foreground">
              {!isSaving ? (
                <>
                  <LucideCircleCheck className="h-3 w-3" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <LucideRefreshCcw className="h-3 w-3" />
                  <span>Saving...</span>
                </>
              )}
            </div>
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
