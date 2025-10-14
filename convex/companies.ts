import { getAuthUserId } from "@convex-dev/auth/server"
import { v } from "convex/values"
import { CustomConvexError } from "../src/lib/errors"
import { Doc } from "./_generated/dataModel"
import { mutation, query } from "./_generated/server"
import { createNode } from "./nodes"

export const search = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    let companies: Doc<"companies">[] = []

    if (!args.query.length) companies = await ctx.db.query("companies").take(10)
    else
      companies = await ctx.db
        .query("companies")
        .withSearchIndex("search_name", (q) => q.search("name", args.query))
        .take(10)

    return companies
  },
})

export const addToStructure = mutation({
  args: {
    companyId: v.id("companies"),
    structureId: v.string(),
    x: v.number(),
    y: v.number(),
  },
  handler: async (ctx, args) => {
    const serializedStructureId = ctx.db.normalizeId(
      "structures",
      args.structureId,
    )
    if (!serializedStructureId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Structure not found",
      })

    const company = await ctx.db.get(args.companyId)
    if (!company)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Company not found",
      })

    const nodeId = await createNode(ctx, {
      x: args.x,
      y: args.y,
      w: 100,
      h: 100,
      label: company.name,
      info: "",
      structureId: args.structureId,
      borderColour: "#000000",
      bgColour: "#FFFFFF",
      companyId: company._id,
    })

    return nodeId
  },
})

export const create = mutation({
  args: {
    company: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      city: v.optional(v.string()),
      stateProvince: v.optional(v.string()),
      country: v.optional(v.string()),
      employees: v.optional(v.string()),
      yearFounded: v.optional(v.number()),
      website: v.optional(v.string()),
      logo: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId)
      throw new CustomConvexError({
        statusCode: 401,
        message: "Unauthorized",
      })

    const company = await ctx.db.insert("companies", {
      name: args.company.name,
      description: args.company.description,
      city: args.company.city,
      stateProvince: args.company.stateProvince,
      country: args.company.country,
      employees: args.company.employees,
      yearFounded: args.company.yearFounded,
      website: args.company.website,
      logo: "",
    })

    await ctx.db.insert("companyOwners", {
      companyId: company,
      userId,
    })

    return company
  },
})

export const update = mutation({
  args: {
    companyId: v.id("companies"),
    data: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      city: v.optional(v.string()),
      stateProvince: v.optional(v.string()),
      country: v.optional(v.string()),
      employees: v.optional(v.string()),
      yearFounded: v.optional(v.number()),
      website: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.companyId)
    if (!company)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Company not found",
      })

    await ctx.db.patch(args.companyId, {
      name: args.data.name,
      description: args.data.description,
      city: args.data.city,
      stateProvince: args.data.stateProvince,
      country: args.data.country,
      employees: args.data.employees,
      yearFounded: args.data.yearFounded,
      website: args.data.website,
    })

    return company
  },
})
