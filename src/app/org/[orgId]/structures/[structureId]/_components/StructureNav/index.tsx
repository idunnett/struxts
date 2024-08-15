"use client"

import { Preloaded, usePreloadedQuery } from "convex/react"
import { UserIdentity } from "convex/server"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { api } from "../../../../../../../../convex/_generated/api"

interface Props {
  preloadedStructure: Preloaded<typeof api.structures.getById>
  currentStructureUser: UserIdentity
}

export default function StructureNav({
  preloadedStructure,
  currentStructureUser,
}: Props) {
  const structure = usePreloadedQuery(preloadedStructure)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [manageMembersDialogOpen, setManageMembersDialogOpen] = useState(false)

  const pathname = usePathname()

  return null
  // if (!structure) return null

  // return (
  //   <>
  //     <div className="border-b px-4 py-1">
  //       <div className="flex flex-initial items-center gap-4">
  //         <div className="relative">
  //           <Link
  //             href={`/structures/${structure._id}`}
  //             className={buttonVariants({
  //               variant: "ghost",
  //               className: "h-8",
  //             })}
  //           >
  //             Structure
  //           </Link>
  //           {pathname === `/structures/${structure._id}` && (
  //             <div className="absolute top-full h-[1px] w-full translate-y-1 bg-primary" />
  //           )}
  //         </div>
  //         <MembersMenuItem
  //           structureId={structure._id}
  //           currentStructureUser={currentStructureUser}
  //           onAddMember={() => setAddMemberDialogOpen(true)}
  //           onManageMembers={() => setManageMembersDialogOpen(true)}
  //         />
  //         {isOwner(currentStructureUser.role) && (
  //           <div className="relative">
  //             <Link
  //               href={`/structures/${structure._id}/settings`}
  //               className={buttonVariants({
  //                 variant: "ghost",
  //                 className: "h-8",
  //               })}
  //             >
  //               Settings
  //             </Link>
  //             {pathname === `/structures/${structure._id}/settings` && (
  //               <div className="absolute top-full h-[1px] w-full translate-y-1 bg-primary" />
  //             )}
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //     <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
  //       <DialogContent className="sm:max-w-md">
  //         <DialogHeader>
  //           <DialogTitle>Invite a Member</DialogTitle>
  //         </DialogHeader>
  //         <Suspense
  //           fallback={
  //             <div className="flex h-full w-full items-center justify-center">
  //               <Spinner />
  //             </div>
  //           }
  //         >
  //           <InviteMemberForm structureId={structure._id} />
  //         </Suspense>
  //         <DialogFooter className="sm:justify-start">
  //           <DialogClose asChild>
  //             <Button type="button" variant="secondary">
  //               Close
  //             </Button>
  //           </DialogClose>
  //         </DialogFooter>
  //       </DialogContent>
  //     </Dialog>
  //     <Dialog
  //       open={manageMembersDialogOpen}
  //       onOpenChange={setManageMembersDialogOpen}
  //     >
  //       <DialogContent>
  //         <DialogHeader>
  //           <DialogTitle>Manage Structure Members</DialogTitle>
  //         </DialogHeader>
  //         <Suspense
  //           fallback={
  //             <div className="flex h-full w-full items-center justify-center">
  //               <Spinner />
  //             </div>
  //           }
  //         >
  //           <ManageMembers structureId={structure._id} />
  //         </Suspense>
  //         <DialogFooter className="sm:justify-start">
  //           <DialogClose asChild>
  //             <Button type="button" variant="secondary">
  //               Close
  //             </Button>
  //           </DialogClose>
  //         </DialogFooter>
  //       </DialogContent>
  //     </Dialog>
  //   </>
  // )
}
