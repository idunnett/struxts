import { Pool } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"

import { env } from "~/env"
import * as schema from "./schema"

// const sql = neon(env.DATABASE_URL)
const pool = new Pool({ connectionString: env.DATABASE_URL })

export const db = drizzle(pool, {
  schema,
})
