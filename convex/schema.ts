import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

const structures = defineTable({
  name: v.string(),
  orgId: v.union(v.string(), v.null()),
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

export const edges = defineTable({
  source: v.id("nodes"),
  target: v.id("nodes"),
  colour: v.string(),
  structureId: v.id("structures"),
  labels: v.array(v.object({ label: v.string(), offset: v.number() })),
}).index("by_structureId", ["structureId"])

export const orgStructureUsers = defineTable({
  userId: v.string(),
  orgId: v.union(v.string(), v.null()),
  structureId: v.id("structures"),
  role: v.union(v.literal("Guest"), v.literal("Admin"), v.literal("Owner")),
})

export const files = defineTable({
  storageId: v.string(),
  nodeId: v.id("nodes"),
  structureId: v.id("structures"),
  orgId: v.union(v.string(), v.null()),
  name: v.string(),
  size: v.number(),
  type: v.string(),
})

export default defineSchema({
  orgStructureUsers,
  structures,
  nodes,
  edges,
  files,
})
