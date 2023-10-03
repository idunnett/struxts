import {
  relations,
  type InferSelectModel,
  type InferInsertModel,
} from 'drizzle-orm'
import { pgTable, serial, text, integer, pgEnum } from 'drizzle-orm/pg-core'

export const nodeTypeEnum = pgEnum('node_type', ['node', 'group'])

export const nodesTable = pgTable('nodes', {
  id: serial('id').primaryKey(),
  x: integer('x').notNull(),
  y: integer('y').notNull(),
  title: text('title').default(''),
  type: nodeTypeEnum('type').notNull(),
  parentId: integer('parentId'),
})

export type Node = InferSelectModel<typeof nodesTable>
export type NodeInsert = InferInsertModel<typeof nodesTable>

export const nodesTableRelations = relations(nodesTable, ({ one }) => ({
  parent: one(nodesTable, {
    fields: [nodesTable.parentId],
    references: [nodesTable.id],
  }),
}))
