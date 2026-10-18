"use client"

import { useAuthActions } from "@convex-dev/auth/react"
import { useConvexAuth } from "convex/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"

export default function SignInPage() {
  const { signIn } = useAuthActions()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const router = useRouter()
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/org")
  }, [isAuthenticated, isLoading, router])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)
    const formData = new FormData(event.currentTarget)
    formData.set("flow", mode)
    try {
      await signIn("password", formData)
      router.replace("/org")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not sign in. Check your email and password.",
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-primary">
            {mode === "signIn" ? "Sign in" : "Create account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "signUp"
              ? "Migrating from Clerk? Use the same email to keep your data."
              : "Welcome back to Struxts"}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={pending}
          onClick={() => {
            setPending(true)
            void signIn("google").finally(() => setPending(false))
          }}
        >
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "signUp" && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" autoComplete="name" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={
                mode === "signIn" ? "current-password" : "new-password"
              }
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending
              ? "Please wait…"
              : mode === "signIn"
                ? "Sign in"
                : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {mode === "signIn" ? (
            <>
              No account?{" "}
              <button
                type="button"
                className="font-medium text-primary underline-offset-4 hover:underline"
                onClick={() => {
                  setMode("signUp")
                  setError(null)
                }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="font-medium text-primary underline-offset-4 hover:underline"
                onClick={() => {
                  setMode("signIn")
                  setError(null)
                }}
              >
                Sign in
              </button>
            </>
          )}
        </p>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
