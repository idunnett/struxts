"use client"

import { signOut } from "next-auth/react"
import { Button } from "./ui/button"

export default function SignOutButton() {
  return (
    <Button className="btn-primary" onClick={() => signOut()}>
      Sign Out
    </Button>
  )
}
