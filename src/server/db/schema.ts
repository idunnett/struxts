import {
  integer,
  primaryKey,
  pgTable,
  text,
  serial,
  timestamp,
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

export const usersStructures = pgTable(
  "users_structures",
  {
    userId: text("userId").notNull(),
    structureId: serial("structureId")
      .notNull()
      .references(() => structures.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.structureId] }),
    }
  },
)

export const nodes = pgTable("nodes", {
  id: serial("id").primaryKey(),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  w: integer("w").notNull(),
  h: integer("h").notNull(),
  title: text("title").default(""),
  description: text("description").default(""),
  // type: nodeTypeEnum("type").notNull(),
  // bgColor: text("bg_color").notNull().default("#ffffff"),
  // textColor: text("text_color").notNull().default("#000000"),
  parentId: integer("parentId"),
  structureId: serial("structureId")
    .notNull()
    .references(() => structures.id),
})
