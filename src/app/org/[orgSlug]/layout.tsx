import { ReactNode } from "react"
import { SyncActiveOrganization } from "../../../lib/sync-active-org"

interface Props {
  children: ReactNode
}

export default function OrgLayout({ children }: Props) {
  return (
    <>
      <SyncActiveOrganization />
      {children}
    </>
  )
}
