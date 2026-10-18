"use node"

/**
 * One-time Clerk → Convex Auth migration (import + remap Clerk IDs).
 *
 * Production cutover order:
 * 1. bun run auth:setup:prod   + set Google OAuth / SITE_URL on prod
 * 2. bun run convex:deploy
 * 3. bun run auth:status:prod  — follow recommendations
 * 4. If runClerkImport: set CLERK_SECRET_KEY on prod, then bun run auth:migrate:prod
 * 5. If runLegacyBackfill: bun run auth:backfill:prod
 * 6. Smoke-test sign-in, then remove Clerk + CLERK_SECRET_KEY
 *
 * Password hashes cannot be exported from Clerk. After migration:
 * - Google users: sign in with Google (same email)
 * - Email/password users: Sign up with the same email to set a new password
 */

import { internal } from "./_generated/api"
import { action } from "./_generated/server"
import type { Id } from "./_generated/dataModel"

async function clerkGetList<T>(
  secret: string,
  path: string,
  searchParams?: Record<string, string | number>,
): Promise<T[]> {
  const url = new URL(`https://api.clerk.com/v1${path}`)
  if (searchParams)
    for (const [k, v] of Object.entries(searchParams))
      url.searchParams.set(k, String(v))
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${secret}` },
  })
  if (!res.ok)
    throw new Error(
      `Clerk API ${path} failed: ${res.status} ${await res.text()}`,
    )
  const json = (await res.json()) as T[] | { data: T[] }
  return Array.isArray(json) ? json : json.data
}

function clerkOrgRoleToOurs(
  role: string | undefined,
): "owner" | "admin" | "member" {
  if (role === "org:admin") return "admin"
  return "member"
}

type ClerkUser = {
  id: string
  first_name: string | null
  last_name: string | null
  image_url: string
  email_addresses: { email_address: string }[]
  primary_email_address_id: string | null
}

type ClerkOrg = {
  id: string
  name: string
  slug: string | null
  image_url: string
  created_by: string | null
  max_allowed_memberships: number | null
  public_metadata: Record<string, unknown>
}

type ClerkMembership = {
  role: string
  public_user_data?: { user_id: string }
}

export const runFromClerk = action({
  args: {},
  handler: async (ctx) => {
    const secret = process.env.CLERK_SECRET_KEY
    if (!secret)
      throw new Error(
        "Set CLERK_SECRET_KEY on the Convex deployment before running migration",
      )

    const userMap: { clerkUserId: string; convexUserId: Id<"users"> }[] = []
    let userOffset = 0
    while (true) {
      const page = await clerkGetList<ClerkUser>(secret, "/users", {
        limit: 100,
        offset: userOffset,
      })
      if (page.length === 0) break
      for (const user of page) {
        const email = (
          user.email_addresses[0]?.email_address
        )?.toLowerCase()
        const name =
          [user.first_name, user.last_name].filter(Boolean).join(" ") ||
          undefined
        const convexUserId = await ctx.runMutation(
          internal.migrationHelpers.upsertMigratedUser,
          {
            legacyClerkUserId: user.id,
            email,
            name,
            image: user.image_url,
          },
        )
        userMap.push({ clerkUserId: user.id, convexUserId })
      }
      userOffset += page.length
      if (page.length < 100) break
    }

    const usersByClerk = new Map(
      userMap.map((u) => [u.clerkUserId, u.convexUserId]),
    )

    const orgMap: {
      clerkOrgId: string
      convexOrgId: Id<"organizations">
    }[] = []
    let orgOffset = 0
    while (true) {
      const page = await clerkGetList<ClerkOrg>(secret, "/organizations", {
        limit: 100,
        offset: orgOffset,
      })
      if (page.length === 0) break

      for (const org of page) {
        const meta = org.public_metadata ?? {}
        const plan = meta.plan as { product?: string } | undefined
        const createdBy =
          usersByClerk.get(org.created_by ?? "") ?? userMap[0]?.convexUserId
        if (!createdBy)
          throw new Error(`No users to attach as creator for org ${org.id}`)

        let pkg: "free" | "pro" | "enterprise" = "free"
        if (plan?.product) pkg = "pro"

        const convexOrgId = await ctx.runMutation(
          internal.migrationHelpers.upsertMigratedOrg,
          {
            legacyClerkOrgId: org.id,
            name: org.name,
            slug: org.slug ?? org.id,
            imageUrl: org.image_url,
            createdById: createdBy,
            maxAllowedMemberships: org.max_allowed_memberships ?? undefined,
            stripeCustomerId: (meta.customer as string | undefined) ?? null,
            package: pkg,
            stripeProductId: plan?.product,
            nodesPerStructure: meta.nodesPerStructure as string | undefined,
            storage: meta.storage as string | undefined,
            structures: meta.structures as string | undefined,
          },
        )
        orgMap.push({ clerkOrgId: org.id, convexOrgId })

        let memOffset = 0
        let sawOwner = false
        while (true) {
          const members = await clerkGetList<ClerkMembership>(
            secret,
            `/organizations/${org.id}/memberships`,
            { limit: 100, offset: memOffset },
          )
          if (members.length === 0) break
          for (const membership of members) {
            const clerkUserId = membership.public_user_data?.user_id
            if (!clerkUserId) continue
            const convexUserId = usersByClerk.get(clerkUserId)
            if (!convexUserId) continue

            let role = clerkOrgRoleToOurs(membership.role)
            if (clerkUserId === org.created_by) {
              role = "owner"
              sawOwner = true
            }

            await ctx.runMutation(
              internal.migrationHelpers.upsertMigratedOrgMember,
              {
                orgId: convexOrgId,
                userId: convexUserId,
                role,
              },
            )
          }
          memOffset += members.length
          if (members.length < 100) break
        }

        if (!sawOwner) {
          await ctx.runMutation(
            internal.migrationHelpers.upsertMigratedOrgMember,
            {
              orgId: convexOrgId,
              userId: createdBy,
              role: "owner",
            },
          )
        }
      }

      orgOffset += page.length
      if (page.length < 100) break
    }

    const remapStats: {
      structuresPatched: number
      membershipsPatched: number
      filesPatched: number
      foldersPatched: number
    } = await ctx.runMutation(internal.migrationHelpers.remapAppData, {
      userMap,
      orgMap,
    })

    return {
      usersMigrated: userMap.length,
      orgsMigrated: orgMap.length,
      remapStats,
      note: "Google users can sign in with Google. Password users should Sign up with the same email to set a new password (linked by email).",
    } as const
  },
})
