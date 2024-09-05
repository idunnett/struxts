import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/sign-in",
  "/api/uploadthing",
])

export default clerkMiddleware((auth, request) => {
  if (isPublicRoute(request)) return
  auth().protect()
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
