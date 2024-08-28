"use client"

import { useAuth } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import Spinner from "~/components/Spinner"
import { Badge } from "~/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { ClerkOrgStructureUser } from "~/types"
import { api } from "../../../../../../../../../convex/_generated/api"
import { Button } from "../../../../../../../../components/ui/button"

interface Props {
  orgId: string
  structureId: string
  member: ClerkOrgStructureUser
  isCurrentUserOwner: boolean
}

export default function ManageMemberActions({
  member,
  orgId,
  structureId,
  isCurrentUserOwner,
}: Props) {
  const session = useAuth()
  const router = useRouter()
  const [isPendingUpdateRole, startUpdateRoleTransition] = useTransition()
  const [isPendingRemoveMember, startRemoveMemberTransition] = useTransition()
  const updateOrgStructureUserRole = useMutation(
    api.orgStructureUsers.updateRole,
  )
  const removeOrgStructureUser = useMutation(api.orgStructureUsers.remove)

  return (
    <div className="flex w-56 items-center gap-2">
      {member.role === "Owner" ? (
        <div className="grow">
          <Badge variant="secondary" className="text-xs">
            Owner
          </Badge>
        </div>
      ) : (
        <>
          {(isCurrentUserOwner || member.role === "Guest") &&
          member.userId !== session.userId ? (
            <Select
              value={member.role}
              onValueChange={(value) => {
                startUpdateRoleTransition(async () => {
                  await updateOrgStructureUserRole({
                    structureId,
                    userId: member.userId,
                    orgId: member.orgId,
                    role: value as ClerkOrgStructureUser["role"],
                  })
                  router.refresh()
                })
              }}
              disabled={isPendingUpdateRole}
            >
              <SelectTrigger className="relative h-8 w-[180px] grow text-xs">
                <SelectValue placeholder="Select a fruit" />
                {isPendingUpdateRole && (
                  <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <Spinner className="h-3 w-3" />
                  </div>
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Guest" className="text-xs">
                    Guest
                  </SelectItem>
                  <SelectItem value="Admin" className="text-xs">
                    Admin
                  </SelectItem>
                  {isCurrentUserOwner && (
                    <SelectItem value="Owner" className="text-xs">
                      Owner
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <div className="grow">
              <Badge variant="secondary" className="text-xs">
                {member.role}
              </Badge>
            </div>
          )}
        </>
      )}
      {member.role !== "Owner" && member.userId !== session.userId && (
        <Button
          variant="destructive"
          size="sm"
          className="h-8 text-xs"
          onClick={() => {
            startRemoveMemberTransition(async () => {
              await removeOrgStructureUser({
                orgId: orgId,
                structureId,
                userId: member.userId,
              })
              router.refresh()
            })
          }}
          disabled={isPendingRemoveMember}
        >
          {isPendingRemoveMember ? "Removing..." : "Remove"}
        </Button>
      )}
    </div>
  )
}
