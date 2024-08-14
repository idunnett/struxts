import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
  type AnyPgColumn,
} from "drizzle-orm/pg-core"

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const structures = pgTable("structures", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdById: text("createdById").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt"),
})

export const usersStructuresRoleEnum = pgEnum("users_structures_role", [
  "Guest",
  "Admin",
  "Owner",
])

export const usersStructures = pgTable(
  "users_structures",
  {
    userId: text("userId").notNull(),
    structureId: serial("structureId")
      .notNull()
      .references(() => structures.id),
    role: usersStructuresRoleEnum("role").notNull().default("Guest"),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.structureId] }),
    }
  },
)

export const userStructureInvites = pgTable(
  "user_structure_invites",
  {
    invitedBy: text("invitedBy").notNull(),
    userId: text("userId").notNull(),
    structureId: serial("structureId")
      .notNull()
      .references(() => structures.id),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.invitedBy, table.userId, table.structureId],
      }),
    }
  },
)

export const nodes = pgTable("nodes", {
  id: serial("id").primaryKey(),
  x: real("x").notNull(),
  y: real("y").notNull(),
  w: integer("w").notNull(),
  h: integer("h").notNull(),
  label: text("label"),
  info: text("info"),
  borderColor: text("border_color").notNull().default("#000000"),
  bgColor: text("bg_color").notNull().default("#ffffff"),
  // type: nodeTypeEnum("type").notNull(),
  // textColor: text("text_color").notNull().default("#000000"),
  structureId: serial("structureId")
    .notNull()
    .references(() => structures.id),
})

export const edges = pgTable("edges", {
  id: serial("id").primaryKey(),
  source: serial("source")
    .notNull()
    .references(() => nodes.id),
  target: serial("target")
    .notNull()
    .references(() => nodes.id),
  color: text("color").notNull().default("#000000"),
  structureId: serial("structureId")
    .notNull()
    .references(() => structures.id),
})

export const edgeLabels = pgTable("edge_labels", {
  id: serial("id").primaryKey(),
  edgeId: integer("edgeId")
    .notNull()
    .references(() => edges.id),
  label: text("label").notNull(),
  offset: integer("offset").notNull().default(50),
})

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url"),
  key: text("key"),
  nodeId: serial("nodeId")
    .notNull()
    .references(() => nodes.id),
  parentId: integer("parentId").references((): AnyPgColumn => files.id),
  isFolder: boolean("isFolder").notNull().default(false),
  structureId: serial("structureId")
    .notNull()
    .references(() => structures.id),
})

export const tempFiles = pgTable("temp_files", {
  key: text("key").primaryKey(),
  structureId: serial("structureId")
    .notNull()
    .references(() => structures.id),
})
