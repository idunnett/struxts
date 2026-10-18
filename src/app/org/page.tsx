"use client"

import { useMutation, useQuery } from "convex/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { api } from "../../../convex/_generated/api"
import { Button, buttonVariants } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"

export default function MyOrgsPage() {
  const orgs = useQuery(api.organizations.listMine)
  const createOrg = useMutation(api.organizations.create)
  const setActive = useMutation(api.organizations.setActive)
  const router = useRouter()
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      const { orgId, slug } = await createOrg({ name })
      await setActive({ orgId })
      router.push(`/org/${slug}/structures`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create org")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="container mx-auto flex h-full w-full justify-center p-8">
      <div className="flex w-full max-w-lg flex-col items-stretch gap-6">
        <h1 className="text-xl font-bold">My Organizations</h1>
        <p className="text-sm text-muted-foreground">
          Organizations are your billing workspaces. Structures and team seats
          live inside an organization.
        </p>

        {orgs === undefined ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : orgs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You don&apos;t belong to an organization yet. Create one to get
            started.
          </p>
        ) : (
          <ul className="space-y-2">
            {orgs.map((org) => (
              <li key={org._id}>
                <Link
                  href={`/org/${org.slug}/structures`}
                  className={buttonVariants({
                    variant: "outline",
                    className: "w-full justify-start",
                  })}
                  onClick={() => void setActive({ orgId: org._id })}
                >
                  {org.name}
                  <span className="ml-auto text-xs capitalize text-muted-foreground">
                    {org.role}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={onCreate} className="space-y-3 rounded-lg border p-4">
          <h2 className="font-semibold">Create organization</h2>
          <div className="space-y-2">
            <Label htmlFor="org-name">Name</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              placeholder="Acme Inc."
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={pending || name.trim().length < 2}>
            {pending ? "Creating…" : "Create"}
          </Button>
        </form>
      </div>
    </div>
  )
}
