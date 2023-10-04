import { z } from 'zod'

export const newStruxtSchema = z.object({
  title: z.string().min(1).max(255),
})
