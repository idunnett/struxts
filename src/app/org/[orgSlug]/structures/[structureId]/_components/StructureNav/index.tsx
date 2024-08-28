"use client"

import { useOrganization } from "@clerk/nextjs"
import {
  LucideCircleCheck,
  LucideRefreshCcw,
  LucideSettings2,
  LucideWaypoints,
} from "lucide-react"
import { useParams } from "next/navigation"
import { use, useState } from "react"
import { api } from "../../../../../../../../convex/_generated/api"
import { Doc } from "../../../../../../../../convex/_generated/dataModel"
import { Button } from "../../../../../../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../../../../components/ui/dialog"
import { usePrefetchedAuthQuery } from "../../../../../../../hooks/usePrefetchedQuery"
import { isOwner } from "../../../../../../../lib/utils"
import { ClerkOrgStructureUser } from "../../../../../../../types"
import { StructureContext } from "../StructureProvider"
import MembersMenuItem from "./MembersMenuItem"
import SettingsMenuItem from "./SettingsMenuItem"

interface Props {
  prefetchedStructure: typeof api.structures.getById._returnType
  orgStructureMembers: ClerkOrgStructureUser[]
  currentOrgStructureUser: Doc<"orgStructureUsers">
}

export default function StructureNav({
  prefetchedStructure,
  orgStructureMembers,
  currentOrgStructureUser,
}: Props) {
  const org = useOrganization()
  const { structureId } = useParams() as { structureId: string }
  const structure = usePrefetchedAuthQuery(
    api.structures.getById,
    prefetchedStructure,
    { id: structureId },
  )

  const { isSaving } = use(StructureContext)
  const [manageMembersDialogOpen, setManageMembersDialogOpen] = useState(false)

  if (!structure) return null

  return (
    <>
      <div className="border-b bg-card px-8 py-1">
        <div className="flex flex-initial items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="flex items-center gap-2 text-xl font-semibold">
              <LucideWaypoints className="h-5 w-5 text-primary" />
              {structure.name}
            </h1>
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
          <div className="flex items-center gap-1">
            {org.isLoaded && org.organization && (
              <MembersMenuItem
                orgId={org.organization.id}
                structureId={structure._id}
                orgStructureMembers={orgStructureMembers}
                currentOrgStructureUser={currentOrgStructureUser}
              />
            )}
            {isOwner(currentOrgStructureUser.role) && (
              <Dialog
                open={manageMembersDialogOpen}
                onOpenChange={setManageMembersDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button type="button" variant="ghost" className="h-8 gap-1">
                    <LucideSettings2 className="h-4 w-4" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Structure Settings</DialogTitle>
                    <DialogDescription hidden>
                      Manage the members and settings of this structure
                    </DialogDescription>
                  </DialogHeader>
                  <SettingsMenuItem structure={structure} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
