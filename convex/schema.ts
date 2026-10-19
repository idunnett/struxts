import { authTables } from "@convex-dev/auth/server"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

const users = defineTable({
  name: v.optional(v.string()),
  /** Display URL (custom upload or OAuth). Prefer this for avatars. */
  image: v.optional(v.string()),
  /** Google (or other OAuth) profile photo URL; kept even when a custom photo is set. */
  oauthImage: v.optional(v.string()),
  /** When set, `image` is a Convex storage URL and OAuth sync must not overwrite it. */
  imageStorageId: v.optional(v.id("_storage")),
  email: v.optional(v.string()),
  emailVerificationTime: v.optional(v.number()),
  phone: v.optional(v.string()),
  phoneVerificationTime: v.optional(v.number()),
  isAnonymous: v.optional(v.boolean()),
  /** Set while migrating off Clerk; used to remap memberships and link sign-in. */
  legacyClerkUserId: v.optional(v.string()),
  activeOrganizationId: v.optional(v.id("organizations")),
})
  .index("email", ["email"])
  .index("phone", ["phone"])
  .index("legacyClerkUserId", ["legacyClerkUserId"])

/** Billing entity: one Stripe customer and subscription per organization. */
const organizations = defineTable({
  name: v.string(),
  slug: v.string(),
  imageUrl: v.optional(v.string()),
  createdById: v.id("users"),
  legacyClerkOrgId: v.optional(v.string()),
  maxAllowedMemberships: v.optional(v.number()),
})
  .index("by_slug", ["slug"])
  .index("legacyClerkOrgId", ["legacyClerkOrgId"])

const orgMembers = defineTable({
  orgId: v.id("organizations"),
  userId: v.id("users"),
  role: v.union(
    v.literal("owner"),
    v.literal("admin"),
    v.literal("member"),
  ),
})
  .index("by_org", ["orgId"])
  .index("by_user", ["userId"])
  .index("by_org_user", ["orgId", "userId"])

const orgBillingAccounts = defineTable({
  orgId: v.id("organizations"),
  stripeCustomerId: v.union(v.string(), v.null()),
  package: v.union(
    v.literal("free"),
    v.literal("pro"),
    v.literal("enterprise"),
  ),
  status: v.union(v.literal("active"), v.literal("inactive")),
  /** Stripe Price / Plan id when subscribed */
  stripePriceId: v.optional(v.string()),
  stripeProductId: v.optional(v.string()),
  nodesPerStructure: v.optional(v.string()),
  storage: v.optional(v.string()),
  structures: v.optional(v.string()),
}).index("by_orgId", ["orgId"])

const structures = defineTable({
  name: v.string(),
  /** Convex organization document id (string form of Id<"organizations">) */
  orgId: v.optional(v.string()),
  createdById: v.optional(v.string()),
  updatedAt: v.number(),
  /** Legacy fields from pre-org rename; backfill then unused. */
  ownerId: v.optional(v.string()),
  companyId: v.optional(v.string()),
}).index("by_org", ["orgId"])

/** Company entities on a structure diagram (not billing orgs). */
const companies = defineTable({
  name: v.string(),
  city: v.optional(v.string()),
  country: v.optional(v.string()),
  description: v.optional(v.string()),
  employees: v.optional(v.string()),
  logo: v.optional(v.string()),
  stateProvince: v.optional(v.string()),
  website: v.optional(v.string()),
  yearFounded: v.optional(v.union(v.number(), v.string())),
}).searchIndex("search_name", { searchField: "name" })

const companyOwners = defineTable({
  companyId: v.string(),
  userId: v.optional(v.string()),
  name: v.optional(v.string()),
}).index("by_company", ["companyId"])

const invites = defineTable({
  email: v.string(),
  structureId: v.id("structures"),
  inviterId: v.string(),
  token: v.string(),
  accepted: v.boolean(),
  createdAt: v.number(),
})
  .index("by_token", ["token"])
  .index("by_structure", ["structureId"])

const nodes = defineTable({
  x: v.number(),
  y: v.number(),
  w: v.number(),
  h: v.number(),
  label: v.string(),
  info: v.string(),
  structureId: v.id("structures"),
  borderColour: v.string(),
  bgColour: v.string(),
  /** Optional link to a `companies` row on the diagram. */
  companyId: v.optional(v.string()),
}).index("by_structureId", ["structureId"])

export const edges = defineTable({
  source: v.id("nodes"),
  target: v.id("nodes"),
  colour: v.string(),
  structureId: v.id("structures"),
  labels: v.array(v.object({ label: v.string(), offset: v.number() })),
}).index("by_structureId", ["structureId"])

export const orgStructureUsers = defineTable({
  userId: v.string(),
  /** Optional only for legacy rows; backfill via migration:backfillOrgStructureOrgIds */
  orgId: v.optional(v.string()),
  structureId: v.id("structures"),
  role: v.union(v.literal("Guest"), v.literal("Admin"), v.literal("Owner")),
})
  .index("by_structure", ["structureId"])
  .index("by_user_org_structure", ["userId", "orgId", "structureId"])

export const files = defineTable({
  storageId: v.string(),
  nodeId: v.id("nodes"),
  structureId: v.id("structures"),
  orgId: v.string(),
  name: v.string(),
  size: v.number(),
  type: v.string(),
  folderId: v.id("folders"),
})
  .index("by_storageId", ["storageId"])
  .index("by_folder", ["folderId"])
  .index("by_node", ["nodeId"])
  .index("by_structure", ["structureId"])

export const folders = defineTable({
  nodeId: v.id("nodes"),
  structureId: v.id("structures"),
  orgId: v.string(),
  name: v.string(),
})
  .index("by_node", ["nodeId"])
  .index("by_structure", ["structureId"])

export default defineSchema({
  ...authTables,
  users,
  organizations,
  orgMembers,
  orgBillingAccounts,
  orgStructureUsers,
  structures,
  companies,
  companyOwners,
  invites,
  nodes,
  edges,
  files,
  folders,
})
