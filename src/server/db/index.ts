import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

import { env } from "~/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
// const globalForDb = globalThis as unknown as {
//   conn: Database.Database | undefined;
// };

const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, {
  schema,
});

// export const conn =
//   globalForDb.conn ??
//   new Database(env.TURSO_DATABASE_URL, {
//     fileMustExist: false,
//     authToken: env.TURSO_AUTH_TOKEN,
//   });
// if (env.NODE_ENV !== "production") globalForDb.conn = conn;

// export const db = drizzle(conn, { schema });
