"use client"

import { useMutation } from "convex/react"
import { useParams, useRouter } from "next/navigation"
import { FormEvent, useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import Spinner from "~/components/Spinner"
import ErrorDisplay from "~/components/ErrorDisplay"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Skeleton } from "~/components/ui/skeleton"
import { isCustomConvexError } from "~/lib/custom-convex-error"
import { useCurrentOrg } from "~/hooks/useCurrentOrg"
import { api } from "../../../../../convex/_generated/api"

export default function OrgSettingsPage() {
  const params = useParams() as { orgSlug: string }
  const router = useRouter()
  const { org, isLoaded, role } = useCurrentOrg()
  const updateOrg = useMutation(api.organizations.update)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!org) return
    setName(org.name)
    setSlug(org.slug)
  }, [org])

  const canEdit = role === "owner" || role === "admin"
  const dirty = org ? name.trim() !== org.name || slug.trim() !== org.slug : false

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!org || !canEdit) return
    setError(null)
    startTransition(async () => {
      try {
        const result = await updateOrg({
          orgId: org._id,
          name: name.trim(),
          slug: slug.trim(),
        })
        // Navigate before reactive queries see the new slug against the old URL.
        if (result.slug !== params.orgSlug) {
          router.replace(`/org/${result.slug}/settings`)
        }
        toast.success("Organization updated")
      } catch (err) {
        const message = isCustomConvexError(err)
          ? err.data.message
          : err instanceof Error
            ? err.message
            : "Failed to update organization"
        setError(message)
        toast.error(message)
      }
    })
  }

  if (!isLoaded) {
    return (
      <div className="container mx-auto flex max-w-xl flex-col gap-4 p-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!org) {
    return <ErrorDisplay message="Organization not found" statusCode={404} />
  }

  return (
    <div className="container mx-auto flex h-full w-full justify-center p-8">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold">Organization settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage how this organization appears across Struxts.
          </p>
        </div>

        <form className="w-full" onSubmit={handleSubmit}>
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl">General</CardTitle>
              <CardDescription>
                Name and URL slug used to identify your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="org-name">Name</Label>
                  <Input
                    id="org-name"
                    placeholder="Organization name"
                    disabled={isPending || !canEdit}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    minLength={2}
                    maxLength={80}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="org-slug">Slug</Label>
                  <Input
                    id="org-slug"
                    placeholder="organization-slug"
                    disabled={isPending || !canEdit}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    minLength={2}
                    maxLength={48}
                    required
                    pattern="[a-zA-Z0-9\-]+"
                    title="Letters, numbers, and hyphens only"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used in URLs:{" "}
                    <span className="font-mono">
                      /org/{slug.trim() || "…"}/…
                    </span>
                  </p>
                </div>
                {!canEdit && (
                  <p className="text-sm text-muted-foreground">
                    Only owners and admins can edit organization settings.
                  </p>
                )}
                {error && (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  isPending || !canEdit || !dirty || name.trim().length < 2
                }
              >
                {isPending && <Spinner className="mr-2" />}
                Save
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}
