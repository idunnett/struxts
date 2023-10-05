import { z } from 'zod'

export const newNodeSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  bgColor: z.string(),
  textColor: z.string(),
})
