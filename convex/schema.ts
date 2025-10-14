import { authTables } from "@convex-dev/auth/server"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

const structures = defineTable({
  name: v.string(),
  ownerId: v.id("users"),
  updatedAt: v.number(),
})

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
  companyId: v.optional(v.id("companies")),
}).index("by_structureId", ["structureId"])

export const edges = defineTable({
  source: v.id("nodes"),
  target: v.id("nodes"),
  colour: v.string(),
  structureId: v.id("structures"),
  labels: v.array(v.object({ label: v.string(), offset: v.number() })),
}).index("by_structureId", ["structureId"])

export const orgStructureUsers = defineTable({
  userId: v.id("users"),
  structureId: v.id("structures"),
  role: v.union(v.literal("Guest"), v.literal("Admin"), v.literal("Owner")),
})

export const files = defineTable({
  storageId: v.string(),
  nodeId: v.id("nodes"),
  structureId: v.id("structures"),
  name: v.string(),
  size: v.number(),
  type: v.string(),
  folderId: v.id("folders"),
})

export const folders = defineTable({
  nodeId: v.id("nodes"),
  structureId: v.id("structures"),
  name: v.string(),
})

export const companies = defineTable({
  name: v.string(),
  yearFounded: v.optional(v.number()),
  employees: v.optional(v.string()),
  description: v.optional(v.string()),
  city: v.optional(v.string()),
  stateProvince: v.optional(v.string()),
  country: v.optional(v.string()),
  website: v.optional(v.string()),
  logo: v.optional(v.string()),
}).searchIndex("search_name", {
  searchField: "name",
})

export const companyOwners = defineTable({
  companyId: v.id("companies"),
  userId: v.optional(v.id("users")),
  name: v.optional(v.string()),
  title: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
})

export const companyMembers = defineTable({
  companyId: v.id("companies"),
  userId: v.id("users"),
})

export default defineSchema({
  ...authTables,
  orgStructureUsers,
  structures,
  nodes,
  edges,
  files,
  folders,
  companies,
  companyOwners,
})
