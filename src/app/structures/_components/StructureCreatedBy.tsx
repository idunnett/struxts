import { clerkClient } from "@clerk/nextjs/server"

interface Props {
  userId: string
}

export default async function StructureCreatedBy({ userId }: Props) {
  const user = await clerkClient.users.getUser(userId)

  return <p className="text-sm text-gray-500">Created by {user.fullName}</p>
}
