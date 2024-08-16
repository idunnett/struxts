import { CreateOrganization } from "@clerk/nextjs"

export default function NewOrgPage() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <CreateOrganization path="/org/new" />
    </div>
  )
}
