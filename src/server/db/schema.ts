import { relations } from "drizzle-orm"
import {
  index,
  integer,
  primaryKey,
  pgTable,
  text,
  serial,
  uuid,
  timestamp,
} from "drizzle-orm/pg-core"
import { type AdapterAccount } from "next-auth/adapters"

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const structures = pgTable("structures", {
  id: serial("id").primaryKey(),
  name: text("name"),
  createdById: uuid("createdById")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt"),
})

export const usersStructures = pgTable(
  "users_structures",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id),
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

export const users = pgTable("user", {
  id: uuid("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified").defaultNow(),
  image: text("image"),
})

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}))

export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_userId_idx").on(account.userId),
  }),
)

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessions = pgTable(
  "session",
  {
    sessionToken: text("sessionToken").notNull().primaryKey(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires").notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  }),
)

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires").notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
)
