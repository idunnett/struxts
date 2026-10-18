/**
 * Generates JWT keys for Convex Auth and prints env set commands.
 *
 *   bun run auth:setup           # dev deployment
 *   bun run auth:setup -- --prod # production deployment
 *
 * Google callback URL (use the matching deployment's .convex.site host):
 *   https://<deployment>.convex.site/api/auth/callback/google
 */
import { exportJWK, exportPKCS8, generateKeyPair } from "jose"

const prod = process.argv.includes("--prod")
const flag = prod ? " --prod" : ""
const siteUrl = prod
  ? "<https://your-production-domain.com>"
  : "http://localhost:3000"

const keys = await generateKeyPair("RS256", { extractable: true })
const privateKey = await exportPKCS8(keys.privateKey)
const publicKey = await exportJWK(keys.publicKey)
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] })
const jwtPrivateKey = privateKey.trimEnd().replace(/\n/g, " ")

console.log(`
# Convex Auth env for ${prod ? "PRODUCTION" : "DEV"}
# Generate separate keys for prod vs dev (do not reuse).

bunx convex env set${flag} SITE_URL "${siteUrl}"
bunx convex env set${flag} JWT_PRIVATE_KEY "${jwtPrivateKey}"
bunx convex env set${flag} JWKS '${jwks}'

# Google OAuth — use a separate Google client for prod vs localhost
# Redirect URI: https://YOUR_${prod ? "PROD" : "DEV"}_DEPLOYMENT.convex.site/api/auth/callback/google
bunx convex env set${flag} AUTH_GOOGLE_ID "<client-id>"
bunx convex env set${flag} AUTH_GOOGLE_SECRET "<client-secret>"

# Only if status says runClerkImport (Clerk IDs still in the DB):
bunx convex env set${flag} CLERK_SECRET_KEY "<your-clerk-secret>"
`)
