"use client"

import { useMutation, useQuery } from "convex/react"
import { useRef, useState, useTransition } from "react"
import { toast } from "sonner"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import Spinner from "~/components/Spinner"
import { UserAvatar } from "~/components/UserAvatar"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Skeleton } from "~/components/ui/skeleton"
import { isCustomConvexError } from "~/lib/custom-convex-error"

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif"

export default function AccountPage() {
  const viewer = useQuery(api.users.viewer)
  const generateUploadUrl = useMutation(api.users.generateAvatarUploadUrl)
  const setAvatar = useMutation(api.users.setAvatar)
  const clearCustomAvatar = useMutation(api.users.clearCustomAvatar)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [preview, setPreview] = useState<string | null>(null)

  function handleFileChange(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5MB or smaller")
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    startTransition(async () => {
      try {
        const uploadUrl = await generateUploadUrl()
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        })
        if (!result.ok) throw new Error("Upload failed")
        const { storageId } = (await result.json()) as {
          storageId: Id<"_storage">
        }
        await setAvatar({ storageId })
        toast.success("Profile photo updated")
      } catch (err) {
        const message = isCustomConvexError(err)
          ? err.data.message
          : err instanceof Error
            ? err.message
            : "Could not update photo"
        toast.error(message)
      } finally {
        URL.revokeObjectURL(objectUrl)
        setPreview(null)
        if (inputRef.current) inputRef.current.value = ""
      }
    })
  }

  function handleClear() {
    startTransition(async () => {
      try {
        await clearCustomAvatar()
        toast.success(
          viewer?.oauthImage
            ? "Restored Google profile photo"
            : "Profile photo removed",
        )
      } catch (err) {
        const message = isCustomConvexError(err)
          ? err.data.message
          : "Could not clear photo"
        toast.error(message)
      }
    })
  }

  if (viewer === undefined) {
    return (
      <div className="container mx-auto flex max-w-xl flex-col gap-4 p-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (viewer === null) {
    return (
      <div className="container mx-auto p-8 text-sm text-muted-foreground">
        Sign in to manage your account.
      </div>
    )
  }

  return (
    <div className="container mx-auto flex h-full w-full justify-center p-8">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold">Account</h1>
          <p className="text-sm text-muted-foreground">
            Your profile photo appears next to your name across Struxts.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Profile photo</CardTitle>
            <CardDescription>
              Synced from Google when you sign in. You can also upload your own.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <UserAvatar
                src={preview ?? viewer.image}
                name={viewer.name}
                size={64}
                className="text-base"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-sm font-medium">
                  {viewer.name ?? "No name"}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {viewer.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {viewer.hasCustomImage
                    ? "Using your uploaded photo"
                    : viewer.oauthImage
                      ? "Using your Google photo"
                      : "No photo yet"}
                </p>
              </div>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
          </CardContent>
          <CardFooter className="flex flex-wrap justify-end gap-2">
            {viewer.hasCustomImage && (
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={handleClear}
              >
                {viewer.oauthImage ? "Use Google photo" : "Remove photo"}
              </Button>
            )}
            <Button
              type="button"
              disabled={isPending}
              onClick={() => inputRef.current?.click()}
            >
              {isPending && <Spinner className="mr-2" />}
              {isPending ? "Uploading…" : "Upload photo"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
