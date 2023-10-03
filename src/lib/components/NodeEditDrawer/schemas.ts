import { z } from 'zod'

export const newNodeSchema = z.object({
  id: z.number(),
  title: z.string(),
})
