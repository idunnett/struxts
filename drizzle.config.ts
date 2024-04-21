import { type Config } from "drizzle-kit"

import { env } from "~/env"

export default {
  schema: "./src/server/db/schema.ts",
  driver: "turso",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  },
  tablesFilter: ["struxts_*"],
} satisfies Config
