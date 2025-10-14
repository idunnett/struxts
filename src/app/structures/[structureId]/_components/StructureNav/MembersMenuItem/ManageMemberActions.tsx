"use client"

import { api } from "convex/_generated/api"
import { Doc } from "convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import Spinner from "~/components/Spinner"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

interface Props {
  structureId: string
  orgStructureUser: Doc<"orgStructureUsers">
  isCurrentUserOwner: boolean
}

export default function ManageMemberActions({
  orgStructureUser,
  structureId,
  isCurrentUserOwner,
}: Props) {
  const currentUser = useQuery(api.users.getCurrentUser)

  const router = useRouter()
  const [isPendingUpdateRole, startUpdateRoleTransition] = useTransition()
  const [isPendingRemoveMember, startRemoveMemberTransition] = useTransition()
  const updateOrgStructureUserRole = useMutation(
    api.orgStructureUsers.updateRole,
  )
  const removeOrgStructureUser = useMutation(api.orgStructureUsers.remove)

  return (
    <div className="flex w-56 items-center gap-2">
      {orgStructureUser.role === "Owner" ? (
        <div className="grow">
          <Badge variant="secondary" className="text-xs">
            Owner
          </Badge>
        </div>
      ) : (
        <>
          {(isCurrentUserOwner || orgStructureUser.role === "Guest") &&
          orgStructureUser.userId !== currentUser?._id ? (
            <Select
              value={orgStructureUser.role}
              onValueChange={(value) => {
                startUpdateRoleTransition(async () => {
                  await updateOrgStructureUserRole({
                    structureId,
                    userId: orgStructureUser.userId,
                    role: value as Doc<"orgStructureUsers">["role"],
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
                {orgStructureUser.role}
              </Badge>
            </div>
          )}
        </>
      )}
      {orgStructureUser.role !== "Owner" &&
        orgStructureUser.userId !== currentUser?._id && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              startRemoveMemberTransition(async () => {
                await removeOrgStructureUser({
                  structureId,
                  userId: orgStructureUser.userId,
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
