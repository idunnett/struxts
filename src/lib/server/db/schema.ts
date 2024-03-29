import {
  relations,
  type InferSelectModel,
  type InferInsertModel,
} from 'drizzle-orm'
import {
  pgTable,
  serial,
  text,
  integer,
  pgEnum,
  uuid,
  timestamp,
  primaryKey,
} from 'drizzle-orm/pg-core'

export const profilesTable = pgTable('profiles', {
  id: uuid('id').primaryKey().notNull(),
  updatedAt: timestamp('updated_at'),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
})

export const profileStruxtsTable = pgTable('profile_struxts', {
  userId: uuid('user_id')
    .notNull()
    .references(() => profilesTable.id),
  struxtId: integer('struxt_id')
    .notNull()
    .references(() => struxtsTable.id),
})

export const profileStruxtsTableRelations = relations(
  profileStruxtsTable,
  ({ one }) => ({
    user: one(profilesTable, {
      fields: [profileStruxtsTable.userId],
      references: [profilesTable.id],
    }),
    struxt: one(struxtsTable, {
      fields: [profileStruxtsTable.struxtId],
      references: [struxtsTable.id],
    }),
  })
)

export const struxtsTable = pgTable('struxts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
})

export type Struxt = InferSelectModel<typeof struxtsTable>

export const nodeTypeEnum = pgEnum('node_type', ['node', 'group'])

export const nodesTable = pgTable('nodes', {
  id: serial('id').primaryKey(),
  x: integer('x').notNull(),
  y: integer('y').notNull(),
  w: integer('w').notNull().default(128),
  h: integer('h').notNull().default(40),
  title: text('title').default(''),
  description: text('description').default(''),
  type: nodeTypeEnum('type').notNull(),
  bgColor: text('bg_color').notNull().default('#ffffff'),
  textColor: text('text_color').notNull().default('#000000'),
  parentId: integer('parentId'),
  struxtId: integer('struxtId')
    .notNull()
    .references(() => struxtsTable.id),
})

export type Node = InferSelectModel<typeof nodesTable>
export type NodeInsert = InferInsertModel<typeof nodesTable>

export const nodesTableRelations = relations(nodesTable, ({ one }) => ({
  parent: one(nodesTable, {
    fields: [nodesTable.parentId],
    references: [nodesTable.id],
  }),
}))

export const hLinksTable = pgTable(
  'h_links',
  {
    leftId: integer('left_id')
      .notNull()
      .references(() => nodesTable.id),
    rightId: integer('right_id')
      .notNull()
      .references(() => nodesTable.id),
    struxtId: integer('struxtId')
      .notNull()
      .references(() => struxtsTable.id),
  },
  ({ leftId, rightId, struxtId }) => {
    return {
      pk: primaryKey(leftId, rightId, struxtId),
    }
  }
)

export type HLink = InferSelectModel<typeof hLinksTable>

export const hLinksTableRelations = relations(hLinksTable, ({ one }) => ({
  left: one(nodesTable, {
    fields: [hLinksTable.leftId],
    references: [nodesTable.id],
  }),
  right: one(nodesTable, {
    fields: [hLinksTable.rightId],
    references: [nodesTable.id],
  }),
  struxt: one(struxtsTable, {
    fields: [hLinksTable.struxtId],
    references: [struxtsTable.id],
  }),
}))
