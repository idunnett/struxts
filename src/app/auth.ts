import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"

export async function getAuthToken() {
  return (await convexAuthNextjsToken()) ?? undefined
}
