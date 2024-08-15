import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

const orgs = defineTable({
  name: v.string(),
  createdById: v.string(),
})

const structures = defineTable({
  name: v.string(),
  createdById: v.string(),
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
}).index("by_structureId", ["structureId"])

export const orgUsers = defineTable({
  userId: v.string(),
  organizationId: v.id("orgs"),
  role: v.union(
    v.literal("Guest"),
    v.literal("Member"),
    v.literal("Admin"),
    v.literal("Owner"),
  ),
}).index("by_userId", ["userId"])

export const orgUserStructures = defineTable({
  orgUserId: v.id("orgUsers"),
  structureId: v.id("structures"),
  role: v.union(v.literal("Guest"), v.literal("Admin"), v.literal("Owner")),
})

export default defineSchema({
  orgs,
  orgUsers,
  orgUserStructures,
  structures,
  nodes,
})
