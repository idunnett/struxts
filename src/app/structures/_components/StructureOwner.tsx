import { clerkClient, auth } from "@clerk/nextjs/server"
import Image from "next/image"

interface Props {
  owner: string
}

export default async function StructureOwner({ owner }: Props) {
  const session = auth()
  const user = await clerkClient.users.getUser(owner)

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Owner: </span>
      <div className="flex gap-2">
        <Image
          src={user.imageUrl}
          alt={user.fullName ?? "Structure Owner Picture"}
          className="rounded-full"
          width={24}
          height={24}
        />
        <p>{session.userId === user.id ? "You" : user.fullName}</p>
      </div>
    </div>
  )
}
